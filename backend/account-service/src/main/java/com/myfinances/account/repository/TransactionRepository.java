package com.myfinances.account.repository;

import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // ==================== BÚSQUEDAS POR USUARIO ====================

    /**
     * Buscar todas las transacciones de un usuario
     */
    List<Transaction> findByUserId(UUID userId);

    /**
     * Buscar transacciones por tipo de un usuario
     */
    List<Transaction> findByUserIdAndType(UUID userId, TransactionType type);

    /**
     * Buscar transacciones por categoría de un usuario
     */
    List<Transaction> findByUserIdAndCategoryId(UUID userId, Long categoryId);

    /**
     * Buscar transacciones en un rango de fechas de un usuario
     */
    List<Transaction> findByUserIdAndDateBetween(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Buscar transacciones por tipo en un rango de fechas
     */
    List<Transaction> findByUserIdAndTypeAndDateBetween(
            UUID userId,
            TransactionType type,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Buscar por descripción (búsqueda parcial)
     */
    List<Transaction> findByUserIdAndDescriptionContainingIgnoreCase(UUID userId, String description);

    /**
     * Buscar transacciones de un mes específico
     */
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND YEAR(t.date) = :year AND MONTH(t.date) = :month ORDER BY t.date DESC")
    List<Transaction> findByUserIdAndYearAndMonth(
            @Param("userId") UUID userId,
            @Param("year") int year,
            @Param("month") int month
    );

    /**
     * Últimas N transacciones de un usuario
     */
    List<Transaction> findTop10ByUserIdOrderByDateDesc(UUID userId);

    // ==================== CÁLCULOS ====================

    /**
     * Calcular suma total por tipo de un usuario
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.userId = :userId AND t.type = :type")
    BigDecimal sumByUserIdAndType(@Param("userId") UUID userId, @Param("type") TransactionType type);

    /**
     * Calcular suma por tipo en un rango de fechas
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.userId = :userId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserIdAndTypeAndDateBetween(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Calcular suma por categoría de un usuario
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.userId = :userId AND t.category.id = :categoryId")
    BigDecimal sumByUserIdAndCategoryId(@Param("userId") UUID userId, @Param("categoryId") Long categoryId);

    /**
     * Contar transacciones por tipo de un usuario
     */
    Long countByUserIdAndType(UUID userId, TransactionType type);

    // ==================== ELIMINACIÓN ====================

    /**
     * Eliminar todas las transacciones de un usuario
     */
    void deleteByUserId(UUID userId);

    /**
     * Verificar si existe transacción vinculada a una inversión
     */
    boolean existsByUserIdAndInvestmentId(UUID userId, Long investmentId);
}