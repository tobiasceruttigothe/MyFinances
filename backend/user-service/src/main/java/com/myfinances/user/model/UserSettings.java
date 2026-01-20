package com.myfinances.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Configuraciones personalizables del usuario
 */
@Entity
@Table(name = "user_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * ⭐ Si TRUE: al crear inversiones se generan transacciones automáticamente
     */
    @Column(name = "link_investments_to_transactions", nullable = false)
    private Boolean linkInvestmentsToTransactions = false;

    /**
     * Moneda preferida del usuario (ISO 4217)
     */
    @Column(length = 3, nullable = false)
    private String currency = "USD";

    /**
     * Timezone del usuario
     */
    @Column(length = 50)
    private String timezone = "America/Argentina/Buenos_Aires";

    /**
     * Idioma preferido
     */
    @Column(length = 5)
    private String language = "es";

    /**
     * ⭐ Habilitar asignaciones automáticas a metas de ahorro
     */
    @Column(name = "enable_auto_goal_assignments", nullable = false)
    private Boolean enableAutoGoalAssignments = true;
}