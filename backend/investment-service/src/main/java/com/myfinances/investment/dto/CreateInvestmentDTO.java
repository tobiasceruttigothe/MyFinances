package com.myfinances.investment.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvestmentDTO {

    @NotBlank(message = "El tipo es obligatorio")
    @Size(max = 50, message = "El tipo no puede exceder los 50 caracteres")
    private String type;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 200, message = "La descripción no puede exceder los 200 caracteres")
    private String description;

    @NotNull(message = "El capital inicial es obligatorio")
    @DecimalMin(value = "0.01", message = "El capital inicial debe ser mayor a 0")
    @Digits(integer = 10, fraction = 2, message = "El capital inicial debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal initialCapital;

    @NotNull(message = "El capital actual es obligatorio")
    @DecimalMin(value = "0.00", message = "El capital actual no puede ser negativo")
    @Digits(integer = 10, fraction = 2, message = "El capital actual debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal currentCapital;

    private LocalDateTime investmentDate; // Opcional: Si no se provee, usa fecha actual

    @Size(max = 500, message = "Las notas no pueden exceder los 500 caracteres")
    private String notes;

    /**
     * Indica si se debe crear transacción automática en account-service
     * Si no se especifica, se usará la configuración del usuario
     */
    private Boolean createLinkedTransaction;
}