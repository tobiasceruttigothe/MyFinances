package com.myfinances.account.dto;

import com.myfinances.account.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CategoryDTO {

    private Long id;

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    private String name;

    @NotNull(message = "El tipo es obligatorio (INCOME/EXPENSE)")
    private TransactionType type;

    /**
     * ⭐ ID de la categoría padre (NULL si es categoría raíz)
     */
    private Long parentId;

    @Size(max = 200, message = "La descripción no puede exceder los 200 caracteres")
    private String description;

    // Campos calculados (para respuestas enriquecidas)
    private Long transactionCount;
    private BigDecimal totalAmount;
}