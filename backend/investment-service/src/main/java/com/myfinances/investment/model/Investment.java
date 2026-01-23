package com.myfinances.investment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad que representa una inversión
 */
@Entity
@Table(name = "investments", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_user_type", columnList = "user_id, type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ⭐ Usuario dueño de esta inversión
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Tipo de inversión: ACCION, BONO, PLAZO_FIJO, CRYPTO, FONDO, INMUEBLE, etc.
     */
    @Column(nullable = false, length = 50)
    private String type;

    /**
     * Descripción de la inversión
     */
    @Column(nullable = false, length = 200)
    private String description;

    /**
     * Capital inicial invertido
     */
    @Column(name = "initial_capital", nullable = false, precision = 15, scale = 2)
    private BigDecimal initialCapital;

    /**
     * Capital actual (valor de mercado)
     * Se actualiza manualmente por el usuario
     */
    @Column(name = "current_capital", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentCapital;

    /**
     * Fecha de la inversión
     */
    @Column(name = "investment_date", nullable = false)
    private LocalDateTime investmentDate;

    /**
     * Notas adicionales
     */
    @Column(length = 500)
    private String notes;

    /**
     * ⭐ Si TRUE, se creó una transacción en account-service
     */
    @Column(name = "linked_transaction_created", nullable = false)
    private Boolean linkedTransactionCreated = false;

    /**
     * ID de la transacción vinculada en account-service (si existe)
     */
    @Column(name = "transaction_id")
    private Long transactionId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Método helper para calcular ganancia/pérdida
     */
    public BigDecimal getProfit() {
        return currentCapital.subtract(initialCapital);
    }

    /**
     * Método helper para calcular ROI (Return on Investment) en porcentaje
     */
    public BigDecimal getROI() {
        if (initialCapital.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return getProfit()
                .divide(initialCapital, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}