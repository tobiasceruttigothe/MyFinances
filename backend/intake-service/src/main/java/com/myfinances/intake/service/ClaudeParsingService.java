package com.myfinances.intake.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.models.messages.CacheControlEphemeral;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.StructuredMessageCreateParams;
import com.anthropic.models.messages.TextBlockParam;
import com.myfinances.intake.model.ParsedTransaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Convierte un mensaje en español ("gasté 4500 en el súper") en una
 * {@link ParsedTransaction} estructurada, usando la API de Anthropic con
 * structured outputs (el schema se deriva del record, no se parsea texto a mano).
 */
@Service
@Slf4j
public class ClaudeParsingService {

    private final AnthropicClient anthropic;
    private final String model;

    public ClaudeParsingService(AnthropicClient anthropic,
                                @Value("${anthropic.model:claude-haiku-4-5}") String model) {
        this.anthropic = anthropic;
        this.model = model;
    }

    /**
     * @param userText      el mensaje del usuario.
     * @param categoryNames nombres de las categorías del usuario (destinos válidos).
     */
    public ParsedTransaction parse(String userText, List<String> categoryNames) {
        String systemPrompt = buildSystemPrompt(categoryNames);

        // Caching del system prompt: en Haiku el mínimo cacheable es ~4096 tokens, así que
        // con un prompt corto NO se cachea (silenciosamente). Se deja el breakpoint igual:
        // es gratis si no cachea, y ayuda si el prompt crece o se usa un modelo mayor.
        StructuredMessageCreateParams<ParsedTransaction> params = MessageCreateParams.builder()
                .model(model)
                .maxTokens(1024L)
                .systemOfTextBlockParams(List.of(
                        TextBlockParam.builder()
                                .text(systemPrompt)
                                .cacheControl(CacheControlEphemeral.builder().build())
                                .build()))
                .outputConfig(ParsedTransaction.class)
                .addUserMessage(userText)
                .build();

        log.debug("Parseando con Claude (modelo={}): {}", model, userText);

        return anthropic.messages().create(params).content().stream()
                .flatMap(block -> block.text().stream())
                .map(typed -> typed.text())   // structured output → ParsedTransaction tipado
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Claude no devolvió contenido estructurado"));
    }

    private String buildSystemPrompt(List<String> categoryNames) {
        String categories = categoryNames.isEmpty()
                ? "(el usuario no tiene categorías; usá una descripción genérica)"
                : categoryNames.stream().map(c -> "- " + c).reduce((a, b) -> a + "\n" + b).orElse("");

        return """
                Sos un asistente que registra movimientos de dinero de una app de finanzas personales en Argentina.
                Recibís un mensaje corto en español (puede ser informal, con jerga argentina) y extraés UNA transacción.

                Reglas:
                - `understood`: true solo si el mensaje describe claramente un gasto o ingreso de dinero. \
                Si es un saludo, una pregunta, o algo que no es una transacción, devolvé understood=false y el resto en valores vacíos/0.
                - `amount`: el monto como número positivo, sin símbolos ni separadores de miles (ej: 4500.50). \
                Interpretá montos informales: "4 lucas"/"4 palos verdes" no; "4 lucas" = 4000; "20 mil" = 20000.
                - `type`: "EXPENSE" para gastos (gasté, compré, pagué, me salió) o "INCOME" para ingresos (cobré, me pagaron, sueldo, me depositaron).
                - `category`: elegí EXACTAMENTE uno de los nombres de la lista de categorías del usuario, el más apropiado. \
                Si ninguno encaja bien, elegí el más cercano igual.
                - `description`: una descripción corta y clara (máx 100 caracteres), ej: "Supermercado", "Nafta", "Sueldo".
                - `notes`: detalle adicional si el mensaje lo aporta, si no devolvé cadena vacía.

                Categorías disponibles del usuario:
                %s
                """.formatted(categories);
    }
}
