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
public class PortfolioSummaryDTO {

    private BigDecimal totalInvested;
    private BigDecimal totalCurrentValue;
    private BigDecimal totalProfit;
    private BigDecimal overallROI;
    private Long totalInvestments;

    private java.util.List<InvestmentSummaryDTO> byType;

    private LocalDateTime calculatedAt;
}
