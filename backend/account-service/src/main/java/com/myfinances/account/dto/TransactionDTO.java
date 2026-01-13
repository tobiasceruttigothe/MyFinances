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
public class TransactionDTO {

    private Long id;

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

    private String categoryName; // Para respuestas

    private LocalDateTime date;

    private String notes; // Notas adicionales opcionales
}
