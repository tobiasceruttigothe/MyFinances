package com.myfinances.account.dto;

import com.myfinances.account.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
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
public class UpdateTransactionDTO {

    @Size(max = 100, message = "La descripción no puede exceder los 100 caracteres")
    private String description;

    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Digits(integer = 10, fraction = 2, message = "El monto debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal amount;

    private TransactionType type;

    private Long categoryId;

    private LocalDateTime date;

    @Size(max = 500, message = "Las notas no pueden exceder los 500 caracteres")
    private String notes;
}