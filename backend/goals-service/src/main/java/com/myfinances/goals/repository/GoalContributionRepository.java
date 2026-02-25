package com.myfinances.goals.repository;

import com.myfinances.goals.model.ContributionType;
import com.myfinances.goals.model.GoalContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface GoalContributionRepository extends JpaRepository<GoalContribution, Long> {

    List<GoalContribution> findByGoalIdOrderByContributionDateDesc(Long goalId);

    List<GoalContribution> findByGoalIdAndYearAndMonthOrderByCreatedAtAsc(Long goalId, Integer year, Integer month);

    /**
     * Suma total de aportes de una meta (el currentAmount real)
     */
    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM GoalContribution c WHERE c.goal.id = :goalId")
    BigDecimal sumAmountByGoalId(@Param("goalId") Long goalId);

    /**
     * Suma de aportes de un mes específico para una meta
     */
    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM GoalContribution c WHERE c.goal.id = :goalId AND c.year = :year AND c.month = :month")
    BigDecimal sumAmountByGoalIdAndYearAndMonth(@Param("goalId") Long goalId, @Param("year") Integer year, @Param("month") Integer month);

    /**
     * Verifica si ya existe un aporte AUTO para una meta en un mes dado.
     * Evita duplicados del scheduler.
     */
    boolean existsByGoalIdAndYearAndMonthAndType(Long goalId, Integer year, Integer month, ContributionType type);

    /**
     * Todos los aportes de un usuario (para resumen global)
     */
    List<GoalContribution> findByUserIdOrderByContributionDateDesc(UUID userId);

    /**
     * Aporte por ID validando que pertenezca al usuario
     */
    boolean existsByIdAndUserId(Long id, UUID userId);
}