package com.myfinances.account.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Categorías de transacciones con soporte para:
 * - Categorías del sistema (userId = NULL)
 * - Categorías de usuario (userId = UUID)
 * - Jerarquía (parent-child con parentId)
 */
@Entity
@Data
@Table(name = "category_types", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "name", "parent_id"})
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ⭐ NULL = Categoría del sistema (template)
     * ⭐ UUID = Categoría del usuario específico
     */
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false, length = 50)
    private String name;

    /**
     * Tipo de transacción: INCOME o EXPENSE
     */
    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    /**
     * ⭐ ID de la categoría padre (NULL si es categoría raíz)
     * Permite jerarquía: Transporte → Combustible
     */
    @Column(name = "parent_id")
    private Long parentId;

    /**
     * TRUE si es categoría del sistema (template)
     */
    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;

    /**
     * Descripción opcional
     */
    @Column(length = 200)
    private String description;
}