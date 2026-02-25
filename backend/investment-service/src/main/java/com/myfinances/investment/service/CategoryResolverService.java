package com.myfinances.investment.service;

import com.myfinances.investment.client.AccountServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Resuelve el ID de la categoría "Inversiones" dinámicamente desde account-service.
 *
 * PROBLEMA ORIGINAL: InvestmentService usaba categoryId = 1L hardcodeado,
 * lo cual podía apuntar a cualquier categoría o no existir.
 *
 * SOLUCIÓN: Buscar por nombre en el momento de crear la transacción.
 * Si la categoría no existe, la excepción activa el circuit breaker fallback
 * y NO se crea una transacción con categoría incorrecta.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryResolverService {

    private final AccountServiceClient accountServiceClient;

    // Nombres posibles para la categoría de inversiones (en orden de preferencia)
    private static final List<String> INVESTMENT_CATEGORY_NAMES = List.of(
            "INVERSIONES", "INVERSION", "INVERSIÓN", "INVESTMENT"
    );

    /**
     * Busca el ID de la categoría de inversiones para el usuario.
     * Prueba los nombres en orden hasta encontrar una coincidencia.
     *
     * @throws IllegalStateException si no existe ninguna categoría de inversiones
     */
    public Long resolveInvestmentCategoryId(UUID userId) {
        for (String categoryName : INVESTMENT_CATEGORY_NAMES) {
            try {
                Map<String, Object> category = accountServiceClient.getCategoryByName(userId, categoryName);
                if (category != null && category.containsKey("id")) {
                    Long id = Long.valueOf(category.get("id").toString());
                    log.debug("Categoría '{}' resuelta con id={} para userId={}", categoryName, id, userId);
                    return id;
                }
            } catch (Exception e) {
                log.debug("Categoría '{}' no encontrada para userId={}: {}", categoryName, userId, e.getMessage());
            }
        }

        throw new IllegalStateException(
                "No se encontró una categoría de inversiones para el usuario " + userId +
                        ". Asegurate de que exista una categoría llamada 'INVERSIONES' en account-service."
        );
    }
}