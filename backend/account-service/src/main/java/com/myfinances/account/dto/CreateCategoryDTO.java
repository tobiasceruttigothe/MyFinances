package com.myfinances.account.dto;

import com.myfinances.account.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCategoryDTO {

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    private String name;

    @NotNull(message = "El tipo es obligatorio (INCOME/EXPENSE)")
    private TransactionType type;

    private Long parentId; // Opcional: NULL para categorías raíz

    @Size(max = 200, message = "La descripción no puede exceder los 200 caracteres")
    private String description;
}