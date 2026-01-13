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

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Buscar transacciones por tipo (INCOME/EXPENSE)
    List<Transaction> findByType(TransactionType type);

    // Buscar transacciones por categoría
    List<Transaction> findByCategoryId(Long categoryId);

    // Buscar transacciones en un rango de fechas
    List<Transaction> findByDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Buscar transacciones por tipo en un rango de fechas
    List<Transaction> findByTypeAndDateBetween(TransactionType type, LocalDateTime startDate, LocalDateTime endDate);

    // Calcular suma total por tipo
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type")
    BigDecimal sumByType(@Param("type") TransactionType type);

    // Calcular suma por tipo en un rango de fechas
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumByTypeAndDateBetween(
            @Param("type") TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Calcular suma por categoría
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.category.id = :categoryId")
    BigDecimal sumByCategoryId(@Param("categoryId") Long categoryId);

    // Buscar transacciones recientes (ordenadas por fecha descendente)
    List<Transaction> findTop10ByOrderByDateDesc();

    // Buscar por descripción (búsqueda parcial)
    List<Transaction> findByDescriptionContainingIgnoreCase(String description);

    // Contar transacciones por tipo
    Long countByType(TransactionType type);

    // Transacciones de un mes específico
    @Query("SELECT t FROM Transaction t WHERE YEAR(t.date) = :year AND MONTH(t.date) = :month ORDER BY t.date DESC")
    List<Transaction> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
