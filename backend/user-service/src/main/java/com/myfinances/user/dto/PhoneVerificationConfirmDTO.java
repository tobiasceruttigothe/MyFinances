package com.myfinances.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Confirmación de la verificación de teléfono con el código recibido.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhoneVerificationConfirmDTO {

    @NotBlank(message = "El código es obligatorio")
    private String code;
}
