package com.myfinances.goals.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Meta de ahorro de un usuario.
 *
 * El progreso (currentAmount) se calcula siempre como la suma
 * de todos sus GoalContributions activos — nunca se persiste directo
 * para evitar inconsistencias con el historial.
 */
@Entity
@Table(name = "goals", indexes = {
        @Index(name = "idx_goal_user_id", columnList = "user_id"),
        @Index(name = "idx_goal_user_status", columnList = "user_id, status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    /**
     * Monto total que el usuario quiere acumular
     */
    @Column(name = "target_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal targetAmount;

    /**
     * Cuánto quiere aportar por mes (referencia para el scheduler y estadísticas).
     * NULL si la meta no tiene cuota mensual definida.
     */
    @Column(name = "monthly_target_amount", precision = 15, scale = 2)
    private BigDecimal monthlyTargetAmount;

    /**
     * Si TRUE, el scheduler registra automáticamente el monthlyTargetAmount
     * como aporte el 1ro de cada mes.
     */
    @Column(name = "auto_contribution", nullable = false)
    private Boolean autoContribution = false;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private GoalStatus status = GoalStatus.ACTIVE;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /**
     * Fecha límite opcional. NULL = meta sin vencimiento.
     */
    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * Ícono o emoji representativo (ej: "🚗", "📱", "🏠")
     */
    @Column(length = 10)
    private String icon;

    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<GoalContribution> contributions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}