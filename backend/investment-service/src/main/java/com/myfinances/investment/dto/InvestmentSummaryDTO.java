package com.myfinances.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class InvestmentSummaryDTO {

    private String type;
    private Long count;
    private BigDecimal totalInitialCapital;
    private BigDecimal totalCurrentCapital;
    private BigDecimal totalProfit;
    private BigDecimal averageROI;
}
