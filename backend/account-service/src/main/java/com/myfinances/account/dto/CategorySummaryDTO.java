package com.myfinances.account.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para resumir gastos por categoría
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySummaryDTO {

    private Long categoryId;
    private String categoryName;
    private BigDecimal totalAmount;
    private Long transactionCount;
    private BigDecimal percentage; // Porcentaje del total

    /**
     * Lista de resúmenes por categoría con total general
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySummaryResponse {
        private List<CategorySummaryDTO> categories;
        private BigDecimal grandTotal;
    }
}

