package com.myfinances.investment.repository;

import com.myfinances.investment.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    /**
     * Buscar todas las inversiones de un usuario
     */
    List<Investment> findByUserId(UUID userId);

    /**
     * Buscar inversiones por tipo de un usuario
     */
    List<Investment> findByUserIdAndType(UUID userId, String type);

    /**
     * Calcular el total invertido (capital inicial) de un usuario
     */
    @Query("SELECT COALESCE(SUM(i.initialCapital), 0) FROM Investment i WHERE i.userId = :userId")
    BigDecimal sumInitialCapitalByUserId(@Param("userId") UUID userId);

    /**
     * Calcular el valor actual total de inversiones de un usuario
     */
    @Query("SELECT COALESCE(SUM(i.currentCapital), 0) FROM Investment i WHERE i.userId = :userId")
    BigDecimal sumCurrentCapitalByUserId(@Param("userId") UUID userId);

    /**
     * Contar inversiones de un usuario
     */
    long countByUserId(UUID userId);

    /**
     * Contar inversiones por tipo de un usuario
     */
    long countByUserIdAndType(UUID userId, String type);

    /**
     * Obtener tipos únicos de inversiones de un usuario
     */
    @Query("SELECT DISTINCT i.type FROM Investment i WHERE i.userId = :userId")
    List<String> findDistinctTypesByUserId(@Param("userId") UUID userId);

    /**
     * Eliminar todas las inversiones de un usuario
     */
    void deleteByUserId(UUID userId);
}