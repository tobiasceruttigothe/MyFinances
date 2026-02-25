package com.myfinances.goals.dto;

import com.myfinances.goals.model.ContributionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionResponseDTO {

    private Long id;
    private Long goalId;
    private BigDecimal amount;
    private LocalDateTime contributionDate;
    private Integer year;
    private Integer month;
    private ContributionType type;
    private String notes;
    private LocalDateTime createdAt;
}