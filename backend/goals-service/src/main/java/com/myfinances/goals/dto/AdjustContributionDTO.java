package com.myfinances.goals.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdjustContributionDTO {

    /**
     * Diferencia a aplicar. Puede ser negativa (el usuario usó plata de la meta)
     * o positiva (corrige un aporte por debajo del real).
     *
     * Ej: aportó 100 automático pero en realidad usó 30, entonces amount = -30
     * Ej: quiere registrar 50 extra, amount = +50
     */
    @NotNull(message = "El monto de ajuste es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto de ajuste debe tener valor absoluto mayor a 0",
            payload = {}, inclusive = false)
    @Digits(integer = 13, fraction = 2)
    private BigDecimal amount;

    /**
     * Año del mes que se está ajustando (para las estadísticas)
     */
    @NotNull(message = "El año es obligatorio")
    @Min(2000) @Max(2100)
    private Integer year;

    /**
     * Mes que se está ajustando (1-12)
     */
    @NotNull(message = "El mes es obligatorio")
    @Min(1) @Max(12)
    private Integer month;

    @NotBlank(message = "La razón del ajuste es obligatoria")
    @Size(max = 300)
    private String notes;

    /**
     * TRUE = el ajuste resta (el usuario usó parte del ahorro).
     * FALSE = el ajuste suma (aportó más de lo registrado).
     */
    @NotNull(message = "Debe indicar si el ajuste es una reducción o un incremento")
    private Boolean isReduction;
}