package com.myfinances.account.repository;

import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryType, Long> {

    // ==================== CATEGORÍAS DE USUARIO ====================

    /**
     * Buscar todas las categorías de un usuario
     */
    List<CategoryType> findByUserId(UUID userId);

    /**
     * Buscar categoría por nombre de un usuario específico
     */
    Optional<CategoryType> findByUserIdAndNameIgnoreCase(UUID userId, String name);

    /**
     * Verificar si existe una categoría con ese nombre para el usuario
     */
    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);

    /**
     * Contar categorías de un usuario
     */
    long countByUserId(UUID userId);

    /**
     * Buscar categorías raíz (sin padre) de un usuario
     */
    List<CategoryType> findByUserIdAndParentIdIsNull(UUID userId);

    /**
     * Buscar subcategorías de una categoría padre
     */
    List<CategoryType> findByUserIdAndParentId(UUID userId, Long parentId);

    /**
     * Buscar por tipo de transacción de un usuario
     */
    List<CategoryType> findByUserIdAndType(UUID userId, TransactionType type);

    // ==================== CATEGORÍAS DEL SISTEMA ====================

    /**
     * Buscar todas las categorías del sistema (templates)
     */
    List<CategoryType> findByIsSystemTrue();

    /**
     * Contar categorías del sistema
     */
    long countByIsSystemTrue();

    /**
     * Buscar categoría del sistema por nombre
     */
    Optional<CategoryType> findByUserIdIsNullAndNameIgnoreCase(String name);

    // ==================== ELIMINACIÓN ====================

    /**
     * Eliminar todas las categorías de un usuario
     */
    void deleteByUserId(UUID userId);
}