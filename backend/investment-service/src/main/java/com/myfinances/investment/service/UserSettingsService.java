package com.myfinances.investment.service;

import com.myfinances.investment.client.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Consulta configuraciones del usuario desde user-service vía Feign.
 *
 * Reemplaza la implementación anterior que usaba new RestTemplate() directamente,
 * lo cual ignoraba el service discovery, el circuit breaker y el manejo de errores.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserSettingsService {

    private final UserServiceClient userServiceClient;

    /**
     * Verifica si el usuario tiene habilitada la vinculación automática
     * de inversiones a transacciones en account-service.
     *
     * Si user-service no está disponible, el fallback retorna false
     * (comportamiento seguro: no crear transacciones automáticas ante la duda).
     */
    public boolean shouldLinkInvestmentsToTransactions(UUID userId) {
        try {
            Map<String, Object> profile = userServiceClient.getUserProfile(userId);

            if (profile == null || profile.isEmpty()) {
                log.debug("Perfil vacío para userId={}, usando default: false", userId);
                return false;
            }

            Object setting = profile.get("linkInvestmentsToTransactions");
            if (setting instanceof Boolean) {
                return (Boolean) setting;
            }

            return false;

        } catch (Exception e) {
            log.error("Error consultando settings del usuario {}: {}", userId, e.getMessage());
            return false;
        }
    }
}