package com.myfinances.goals.repository;

import com.myfinances.goals.model.Goal;
import com.myfinances.goals.model.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserId(UUID userId);

    List<Goal> findByUserIdAndStatus(UUID userId, GoalStatus status);

    /**
     * Todas las metas activas con aporte automático habilitado.
     * Usado por el scheduler mensual.
     */
    List<Goal> findByStatusAndAutoContributionTrue(GoalStatus status);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, GoalStatus status);

    @Query("SELECT g FROM Goal g WHERE g.userId = :userId ORDER BY g.createdAt DESC")
    List<Goal> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
}