package com.myfinances.goals.dto;

import com.myfinances.goals.model.GoalStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String icon;

    private BigDecimal targetAmount;
    private BigDecimal currentAmount;      // SUM de contributions
    private BigDecimal monthlyTargetAmount;
    private BigDecimal progressPercentage; // (currentAmount / targetAmount) * 100

    private Boolean autoContribution;
    private GoalStatus status;

    private LocalDate startDate;
    private LocalDate targetDate;
    private LocalDateTime completedAt;

    // Cuánto falta para alcanzar el objetivo
    private BigDecimal remainingAmount;

    // Si tiene targetDate, cuántos meses quedan
    private Long remainingMonths;

    // Cuánto habría que aportar por mes para llegar a tiempo
    private BigDecimal suggestedMonthlyAmount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}