package com.myfinances.goals.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddContributionDTO {

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal amount;

    /**
     * Fecha del aporte. Si no se provee, usa el momento actual.
     */
    private LocalDateTime contributionDate;

    @Size(max = 300, message = "Las notas no pueden exceder los 300 caracteres")
    private String notes;
}