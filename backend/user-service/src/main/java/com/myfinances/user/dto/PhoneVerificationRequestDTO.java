package com.myfinances.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Solicitud para iniciar la verificación de un teléfono (vínculo con WhatsApp).
 * El número debe venir en formato E.164 (ej: +5491122334455).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhoneVerificationRequestDTO {

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^\\+[1-9]\\d{7,14}$",
            message = "El teléfono debe estar en formato E.164, ej: +5491122334455")
    private String phone;
}
