package com.myfinances.account.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Transacción financiera (ingreso o gasto)
 */
@Entity
@Data
@Table(name = "transactions", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_user_date", columnList = "user_id, date"),
        @Index(name = "idx_user_type", columnList = "user_id, type")
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ⭐ Usuario dueño de esta transacción
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType type; // INCOME o EXPENSE

    @ManyToOne
    @JoinColumn(name = "category_id")
    private CategoryType category;

    @Column(nullable = false)
    private LocalDateTime date;

    /**
     * Notas adicionales opcionales
     */
    @Column(length = 500)
    private String notes;

    /**
     * ⭐ Si TRUE, esta transacción fue creada automáticamente desde investment-service
     */
    @Column(name = "linked_to_investment", nullable = false)
    private Boolean linkedToInvestment = false;

    /**
     * ID de la inversión relacionada (si linkedToInvestment = true)
     */
    @Column(name = "investment_id")
    private Long investmentId;
}