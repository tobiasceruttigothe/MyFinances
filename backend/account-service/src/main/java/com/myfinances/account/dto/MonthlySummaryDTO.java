package com.myfinances.account.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para resumen mensual de finanzas
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummaryDTO {

    private int year;
    private int month;
    private String monthName;

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private BigDecimal savingsRate; // Porcentaje de ahorro

    private Long incomeTransactionCount;
    private Long expenseTransactionCount;

    private List<CategorySummaryDTO> expensesByCategory;
    private List<CategorySummaryDTO> incomesByCategory;

    private LocalDateTime calculatedAt;
}

