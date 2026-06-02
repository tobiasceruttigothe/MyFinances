package com.myfinances.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Respuesta del endpoint interno GET /api/v1/users/by-phone/{phone}.
 * La consume el intake-service para resolver el remitente de WhatsApp → userId.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhoneLookupResponseDTO {

    private UUID userId;
    private String phone;
}
