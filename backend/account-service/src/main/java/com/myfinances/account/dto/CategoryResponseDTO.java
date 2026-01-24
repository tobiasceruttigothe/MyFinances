package com.myfinances.account.dto;

import com.myfinances.account.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponseDTO {

    private Long id;
    private String name;
    private TransactionType type;
    private Long parentId;
    private String description;

    // Campos calculados
    private Long transactionCount;
    private BigDecimal totalAmount;
}