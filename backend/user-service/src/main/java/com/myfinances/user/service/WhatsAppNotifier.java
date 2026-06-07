package com.myfinances.user.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Envía mensajes de WhatsApp salientes (ej: el código de verificación de teléfono)
 * a través de un webhook de n8n, que es quien tiene las credenciales de Meta.
 *
 * Diseño (Fase 3): user-service NO habla con Meta directamente — solo dispara un
 * evento genérico {phone, message} hacia n8n, que lo formatea como template de Meta
 * y lo envía. Así las credenciales de WhatsApp viven solo en n8n.
 *
 * Si `notifications.whatsapp.webhook-url` está vacío (dev, sin n8n), es no-op: el
 * código igual queda logueado por UserService, así se puede probar sin WhatsApp.
 */
@Component
@Slf4j
public class WhatsAppNotifier {

    private final RestClient restClient = RestClient.create();
    private final String webhookUrl;

    public WhatsAppNotifier(@Value("${notifications.whatsapp.webhook-url:}") String webhookUrl) {
        this.webhookUrl = webhookUrl;
    }

    public void send(String phone, String message) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.info("[WhatsApp sin configurar] no se envía mensaje saliente a {} (revisá los logs para el código)", phone);
            return;
        }
        try {
            restClient.post()
                    .uri(webhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("phone", phone, "message", message))
                    .retrieve()
                    .toBodilessEntity();
            log.debug("Mensaje de WhatsApp enviado a {} vía n8n", phone);
        } catch (Exception e) {
            // No propagamos: que falle el envío no debe romper el flujo de verificación.
            log.error("Error enviando WhatsApp a {} vía n8n: {}", phone, e.getMessage());
        }
    }
}
