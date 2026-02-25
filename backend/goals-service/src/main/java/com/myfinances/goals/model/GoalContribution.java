package com.myfinances.goals.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Registro de un aporte a una meta de ahorro.
 *
 * Cada fila representa un aporte en un momento dado.
 * Los ajustes se registran como filas adicionales de tipo ADJUSTMENT
 * (pueden ser positivos o negativos) para conservar el historial completo.
 *
 * El currentAmount de la meta = SUM(amount) de todas sus contributions.
 */
@Entity
@Table(name = "goal_contributions", indexes = {
        @Index(name = "idx_contribution_goal_id", columnList = "goal_id"),
        @Index(name = "idx_contribution_user_year_month", columnList = "user_id, year, month")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalContribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Monto del aporte. Puede ser negativo si es un ADJUSTMENT de corrección.
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "contribution_date", nullable = false)
    private LocalDateTime contributionDate;

    /**
     * Año al que corresponde este aporte (para estadísticas mensuales)
     */
    @Column(nullable = false)
    private Integer year;

    /**
     * Mes al que corresponde este aporte (1-12)
     */
    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ContributionType type;

    @Column(length = 300)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}