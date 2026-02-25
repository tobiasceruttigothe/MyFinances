package com.myfinances.investment.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

/**
 * Fallback del Feign client para user-service.
 * Si user-service no responde, retorna un perfil vacío —
 * UserSettingsService interpretará eso como "no vincular automáticamente".
 */
@Component
@Slf4j
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public Map<String, Object> getUserProfile(UUID userId) {
        log.warn("user-service no disponible para userId={}. Usando configuración por defecto.", userId);
        return Collections.emptyMap();
    }
}