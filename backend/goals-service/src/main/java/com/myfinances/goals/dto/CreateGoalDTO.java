package com.myfinances.goals.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoalDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String name;

    @Size(max = 500, message = "La descripción no puede exceder los 500 caracteres")
    private String description;

    @NotNull(message = "El monto objetivo es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto objetivo debe ser mayor a 0")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal targetAmount;

    /**
     * Cuota mensual deseada. Requerida si autoContribution = true.
     */
    @DecimalMin(value = "0.01", message = "La cuota mensual debe ser mayor a 0")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal monthlyTargetAmount;

    /**
     * Si TRUE, el scheduler registrará el monthlyTargetAmount automáticamente
     * el 1ro de cada mes. Requiere monthlyTargetAmount != null.
     */
    private Boolean autoContribution = false;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate startDate;

    /**
     * Fecha límite opcional. NULL = meta sin vencimiento.
     */
    private LocalDate targetDate;

    @Size(max = 10, message = "El ícono no puede exceder los 10 caracteres")
    private String icon;
}