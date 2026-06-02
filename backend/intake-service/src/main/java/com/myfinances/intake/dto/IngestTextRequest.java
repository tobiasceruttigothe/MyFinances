package com.myfinances.intake.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload que envía n8n al recibir un mensaje de WhatsApp (texto, o el texto
 * transcripto de un audio en Fase 2). El intake-service decide qué hacer según
 * si hay una transacción pendiente de confirmación para ese teléfono.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestTextRequest {

    @NotBlank(message = "El teléfono del remitente es obligatorio")
    private String phone;

    @NotBlank(message = "El texto del mensaje es obligatorio")
    private String text;
}
