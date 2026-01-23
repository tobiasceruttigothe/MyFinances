package com.myfinances.investment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

/**
 * Servicio para consultar configuraciones del usuario desde user-service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserSettingsService {

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Verifica si el usuario tiene habilitada la vinculación automática
     * de inversiones a transacciones
     */
    public boolean shouldLinkInvestmentsToTransactions(UUID userId) {
        try {
            // TODO: Hacer llamada a user-service para obtener settings
            // Por ahora retornamos false por defecto
            String url = "http://user-service:8084/api/v1/users/profile";

            // En producción, esto debería usar Feign con el header X-User-Id
            // Map<String, Object> profile = userServiceClient.getProfile(userId);
            // return (Boolean) profile.getOrDefault("linkInvestmentsToTransactions", false);

            return false; // Default: no vincular automáticamente

        } catch (Exception e) {
            log.error("Error consultando settings del usuario {}: {}", userId, e.getMessage());
            return false; // Default en caso de error
        }
    }
}