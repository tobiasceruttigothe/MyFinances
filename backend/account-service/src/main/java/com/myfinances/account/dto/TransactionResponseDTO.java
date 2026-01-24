package com.myfinances.account.dto;

import com.myfinances.account.model.TransactionType;
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
public class TransactionResponseDTO {

    private Long id;
    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime date;
    private String notes;
    private Boolean linkedToInvestment;
    private Long investmentId;
}