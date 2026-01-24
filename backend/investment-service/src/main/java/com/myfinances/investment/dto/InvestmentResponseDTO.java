package com.myfinances.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentResponseDTO {

    private Long id;
    private String type;
    private String description;
    private BigDecimal initialCapital;
    private BigDecimal currentCapital;
    private LocalDateTime investmentDate;
    private String notes;

    // Campos calculados
    private BigDecimal profit; // currentCapital - initialCapital
    private BigDecimal roi; // Return on Investment en porcentaje

    // Información de vinculación
    private Boolean linkedTransactionCreated;
    private Long transactionId;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}