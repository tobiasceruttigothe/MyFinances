package com.myfinances.investment.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// ==================== INVESTMENT DTO ====================
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentDTO {

    private Long id;

    @Size(max = 50, message = "El tipo no puede exceder los 50 caracteres")
    private String type;

    @Size(max = 200, message = "La descripción no puede exceder los 200 caracteres")
    private String description;

    @DecimalMin(value = "0.01", message = "El capital inicial debe ser mayor a 0")
    @Digits(integer = 10, fraction = 2, message = "El capital inicial debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal initialCapital;

    @DecimalMin(value = "0.00", message = "El capital actual no puede ser negativo")
    @Digits(integer = 10, fraction = 2, message = "El capital actual debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal currentCapital;

    private LocalDateTime investmentDate;

    @Size(max = 500, message = "Las notas no pueden exceder los 500 caracteres")
    private String notes;

    /**
     * Indica si se debe crear transacción en account-service
     */
    private Boolean createLinkedTransaction;

    // Campos calculados (solo para respuestas)
    private BigDecimal profit;
    private BigDecimal roi;
    private Boolean linkedTransactionCreated;
    private Long transactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}