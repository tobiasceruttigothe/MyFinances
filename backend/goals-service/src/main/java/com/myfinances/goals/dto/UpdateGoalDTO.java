package com.myfinances.goals.dto;

import com.myfinances.goals.model.GoalStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGoalDTO {

    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @DecimalMin(value = "0.01", message = "El monto objetivo debe ser mayor a 0")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal targetAmount;

    @DecimalMin(value = "0.01", message = "La cuota mensual debe ser mayor a 0")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal monthlyTargetAmount;

    private Boolean autoContribution;

    private LocalDate targetDate;

    @Size(max = 10)
    private String icon;

    /**
     * Solo se permiten transiciones válidas:
     * ACTIVE -> PAUSED, CANCELLED
     * PAUSED -> ACTIVE, CANCELLED
     * COMPLETED y CANCELLED son estados finales (no se pueden cambiar desde aquí)
     */
    private GoalStatus status;
}