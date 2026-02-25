package com.myfinances.goals.dto;

import com.myfinances.goals.model.GoalStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalStatisticsDTO {

    private Long goalId;
    private String goalName;
    private String icon;
    private GoalStatus status;

    private BigDecimal targetAmount;
    private BigDecimal totalContributed;
    private BigDecimal progressPercentage;

    private LocalDate startDate;
    private LocalDate targetDate;
    private LocalDateTime completedAt;

    /**
     * TRUE si se completó antes o en la fecha objetivo
     */
    private Boolean completedOnTime;

    private Integer totalMonths;              // Meses totales desde inicio hasta hoy/completado
    private Integer monthsWithContributions;  // Meses en que se aportó algo
    private Integer monthsWithFullTarget;     // Meses donde se alcanzó o superó la cuota mensual

    private BigDecimal averageMonthlyContribution;
    private BigDecimal monthlyTarget;

    /**
     * Breakdown mes a mes
     */
    private List<MonthlyBreakdownDTO> monthlyBreakdown;

    private BigDecimal bestMonthAmount;
    private String bestMonthLabel;   // "Enero 2025"
    private BigDecimal worstMonthAmount; // El mes con menor aporte (entre los que aportaron)
    private String worstMonthLabel;

    private LocalDateTime calculatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyBreakdownDTO {
        private Integer year;
        private Integer month;
        private String monthLabel; // "Enero 2025"
        private BigDecimal contributed;
        private BigDecimal monthlyTarget;
        private Boolean targetMet;           // contributed >= monthlyTarget
        private BigDecimal cumulativeTotal;  // acumulado hasta este mes
    }
}