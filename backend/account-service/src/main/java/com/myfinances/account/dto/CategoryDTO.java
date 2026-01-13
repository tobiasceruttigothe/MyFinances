package com.myfinances.account.dto;

import jakarta.validation.constraints.NotBlank;
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
    @Size(max = 20, message = "El nombre no puede exceder los 20 caracteres")
    private String name;

    // Campos calculados (para respuestas enriquecidas)
    private Long transactionCount;
    private BigDecimal totalAmount;
}

