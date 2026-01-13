package com.myfinances.account.dto;

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
public class BalanceDTO {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;

    private Long incomeTransactionCount;
    private Long expenseTransactionCount;

    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private LocalDateTime calculatedAt;

    // Porcentaje de ahorro (si los ingresos son mayores a 0)
    public BigDecimal getSavingsRate() {
        if (totalIncome == null || totalIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return balance.divide(totalIncome, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
