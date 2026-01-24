package com.myfinances.account.dto;

import com.myfinances.account.model.TransactionType;
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
public class CreateTransactionDTO {

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 100, message = "La descripción no puede exceder los 100 caracteres")
    private String description;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Digits(integer = 10, fraction = 2, message = "El monto debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal amount;

    @NotNull(message = "El tipo de transacción es obligatorio")
    private TransactionType type;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;

    private LocalDateTime date; // Opcional: Si no se provee, usa fecha actual

    @Size(max = 500, message = "Las notas no pueden exceder los 500 caracteres")
    private String notes;

    // Campos para vincular con inversiones
    private Boolean linkedToInvestment;
    private Long investmentId;
}