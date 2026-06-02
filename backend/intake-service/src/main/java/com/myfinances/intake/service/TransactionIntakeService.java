package com.myfinances.intake.service;

import com.myfinances.intake.client.AccountServiceClient;
import com.myfinances.intake.client.UserServiceClient;
import com.myfinances.intake.dto.IntakeReplyResponse;
import com.myfinances.intake.dto.IntakeReplyResponse.Status;
import com.myfinances.intake.dto.PhoneLookupResponse;
import com.myfinances.intake.model.ParsedTransaction;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Orquesta el flujo conversacional de carga de transacciones por WhatsApp:
 * resolver teléfono → usuario, parsear con IA, pedir confirmación, y crear.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionIntakeService {

    private static final Locale ES_AR = Locale.forLanguageTag("es-AR");
    private static final Set<String> AFFIRMATIVE = Set.of(
            "ok", "oka", "okey", "okay", "dale", "si", "sí", "sip", "sii",
            "confirmo", "confirmar", "listo", "va", "correcto", "exacto", "👍", "✅");
    private static final Set<String> NEGATIVE = Set.of(
            "no", "nop", "nope", "cancela", "cancelar", "cancelá", "borra", "borrar",
            "descarta", "descartar", "mal", "nada", "❌");

    private final UserServiceClient userServiceClient;
    private final AccountServiceClient accountServiceClient;
    private final ClaudeParsingService claudeParsingService;
    private final PendingConfirmationStore pendingStore;

    public IntakeReplyResponse handle(String phone, String rawText) {
        String text = rawText.trim();

        // 1. Resolver el teléfono a un usuario verificado.
        UUID userId;
        try {
            PhoneLookupResponse lookup = userServiceClient.getUserByPhone(phone);
            userId = lookup.getUserId();
        } catch (FeignException.NotFound e) {
            return reply(Status.NOT_LINKED,
                    "Tu número todavía no está vinculado a una cuenta de MyFinances. "
                            + "Entrá a la app, agregá este teléfono en tu perfil y verificalo.");
        } catch (FeignException e) {
            log.error("Error consultando user-service para teléfono {}: {}", phone, e.getMessage());
            return reply(Status.ERROR, "No pude verificar tu cuenta en este momento. Probá de nuevo en un rato.");
        }

        // 2. ¿Hay una transacción pendiente de confirmación para este teléfono?
        Optional<PendingConfirmationStore.Pending> pending = pendingStore.get(phone);
        if (pending.isPresent()) {
            String normalized = text.toLowerCase(ES_AR);
            if (AFFIRMATIVE.contains(normalized)) {
                return confirmAndCreate(phone, pending.get());
            }
            if (NEGATIVE.contains(normalized)) {
                pendingStore.remove(phone);
                return reply(Status.CANCELLED, "Listo, lo descarté. Contame de nuevo cuando quieras.");
            }
            // Cualquier otra cosa: el usuario está corrigiendo → reparseamos abajo.
            log.debug("Mensaje no es confirmación; se reinterpreta como nueva transacción");
        }

        // 3. Nueva transacción: traer categorías, parsear con Claude.
        List<Map<String, Object>> categories;
        try {
            categories = accountServiceClient.getCategories(userId);
        } catch (FeignException e) {
            log.error("Error trayendo categorías para usuario {}: {}", userId, e.getMessage());
            return reply(Status.ERROR, "No pude acceder a tus categorías ahora. Probá más tarde.");
        }

        if (categories.isEmpty()) {
            return reply(Status.ERROR,
                    "Todavía no tenés categorías cargadas. Creá al menos una en la app y volvé a intentar.");
        }

        ParsedTransaction parsed;
        try {
            List<String> categoryNames = categories.stream()
                    .map(c -> String.valueOf(c.get("name")))
                    .toList();
            parsed = claudeParsingService.parse(text, categoryNames);
        } catch (Exception e) {
            log.error("Error parseando con Claude: {}", e.getMessage(), e);
            return reply(Status.ERROR, "No pude procesar el mensaje en este momento. Probá de nuevo en un rato.");
        }

        if (!parsed.understood() || parsed.amount() == null || parsed.amount().signum() <= 0) {
            pendingStore.remove(phone);
            return reply(Status.NOT_UNDERSTOOD,
                    "No entendí eso como un gasto o ingreso. Probá algo como: «gasté 4500 en el súper».");
        }

        Long categoryId = resolveCategoryId(categories, parsed.category(), parsed.type());
        pendingStore.put(phone, new PendingConfirmationStore.Pending(
                userId, parsed, categoryId, java.time.Instant.now()));

        return reply(Status.NEEDS_CONFIRMATION, buildConfirmationPrompt(parsed));
    }

    private IntakeReplyResponse confirmAndCreate(String phone, PendingConfirmationStore.Pending p) {
        ParsedTransaction tx = p.tx();
        Map<String, Object> body = new HashMap<>();
        body.put("description", tx.description());
        body.put("amount", tx.amount());
        body.put("type", tx.type());
        body.put("categoryId", p.categoryId());
        if (tx.notes() != null && !tx.notes().isBlank()) {
            body.put("notes", tx.notes());
        }

        try {
            Map<String, Object> created = accountServiceClient.createTransaction(p.userId(), body);
            pendingStore.remove(phone);
            Long id = created.get("id") instanceof Number n ? n.longValue() : null;
            log.info("Transacción creada vía WhatsApp para usuario {}: id={}", p.userId(), id);
            return IntakeReplyResponse.builder()
                    .status(Status.CREATED)
                    .transactionId(id)
                    .reply("✅ Anotado: " + describe(tx) + ".")
                    .build();
        } catch (FeignException e) {
            log.error("Error creando transacción en account-service: {}", e.getMessage());
            return reply(Status.ERROR, "No pude guardar la transacción. Probá confirmar de nuevo en un momento.");
        }
    }

    /**
     * Resuelve el nombre de categoría devuelto por Claude al id real del usuario.
     * Match case-insensitive exacto → contiene → primera del mismo tipo → primera de la lista.
     */
    private Long resolveCategoryId(List<Map<String, Object>> categories, String name, String type) {
        String target = name == null ? "" : name.trim().toLowerCase(ES_AR);

        Optional<Map<String, Object>> exact = categories.stream()
                .filter(c -> String.valueOf(c.get("name")).trim().toLowerCase(ES_AR).equals(target))
                .findFirst();
        if (exact.isPresent()) {
            return asLong(exact.get().get("id"));
        }

        Optional<Map<String, Object>> contains = categories.stream()
                .filter(c -> !target.isEmpty()
                        && String.valueOf(c.get("name")).toLowerCase(ES_AR).contains(target))
                .findFirst();
        if (contains.isPresent()) {
            return asLong(contains.get().get("id"));
        }

        Optional<Map<String, Object>> sameType = categories.stream()
                .filter(c -> String.valueOf(c.get("type")).equalsIgnoreCase(type))
                .findFirst();
        return asLong(sameType.orElse(categories.get(0)).get("id"));
    }

    private Long asLong(Object value) {
        return value instanceof Number n ? n.longValue() : null;
    }

    private String buildConfirmationPrompt(ParsedTransaction tx) {
        return "Registré: " + describe(tx)
                + ".\nRespondé *OK* para confirmar, o escribilo de nuevo para corregir.";
    }

    private String describe(ParsedTransaction tx) {
        String typeLabel = "INCOME".equalsIgnoreCase(tx.type()) ? "Ingreso" : "Gasto";
        String amount = NumberFormat.getNumberInstance(ES_AR).format(tx.amount());
        return String.format("%s $%s en %s (%s)", typeLabel, amount, tx.category(), tx.description());
    }

    private IntakeReplyResponse reply(Status status, String text) {
        return IntakeReplyResponse.builder().status(status).reply(text).build();
    }
}
