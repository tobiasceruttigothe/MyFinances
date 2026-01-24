package com.myfinances.account.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryDTO {

    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    private String name;

    private Long parentId; // Permite cambiar la categoría padre

    @Size(max = 200, message = "La descripción no puede exceder los 200 caracteres")
    private String description;

    // NOTE: El tipo NO se puede actualizar después de crear
}