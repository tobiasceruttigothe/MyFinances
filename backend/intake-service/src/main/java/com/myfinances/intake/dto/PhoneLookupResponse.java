package com.myfinances.intake.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Espejo local de la respuesta de user-service GET /api/v1/users/by-phone/{phone}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhoneLookupResponse {
    private UUID userId;
    private String phone;
}
