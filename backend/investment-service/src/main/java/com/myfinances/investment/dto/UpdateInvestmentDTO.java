package com.myfinances.investment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInvestmentDTO {

    @Size(max = 50, message = "El tipo no puede exceder los 50 caracteres")
    private String type;

    @Size(max = 200, message = "La descripción no puede exceder los 200 caracteres")
    private String description;

    /**
     * Solo se permite actualizar el capital actual
     * El capital inicial NO se puede modificar después de crear
     */
    @DecimalMin(value = "0.00", message = "El capital actual no puede ser negativo")
    @Digits(integer = 10, fraction = 2, message = "El capital actual debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal currentCapital;

    @Size(max = 500, message = "Las notas no pueden exceder los 500 caracteres")
    private String notes;
}