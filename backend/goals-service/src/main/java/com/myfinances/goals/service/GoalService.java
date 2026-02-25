package com.myfinances.goals.service;

import com.myfinances.goals.dto.*;
import com.myfinances.goals.exception.BadRequestException;
import com.myfinances.goals.exception.ResourceNotFoundException;
import com.myfinances.goals.model.*;
import com.myfinances.goals.repository.GoalContributionRepository;
import com.myfinances.goals.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalContributionRepository contributionRepository;

    // ==================== CRUD DE METAS ====================

    public Goal create(UUID userId, CreateGoalDTO dto) {
        validateAutoContributionConfig(dto.getAutoContribution(), dto.getMonthlyTargetAmount());

        if (dto.getTargetDate() != null && dto.getTargetDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("La fecha objetivo no puede ser anterior a la fecha de inicio");
        }

        Goal goal = Goal.builder()
                .userId(userId)
                .name(dto.getName())
                .description(dto.getDescription())
                .targetAmount(dto.getTargetAmount())
                .monthlyTargetAmount(dto.getMonthlyTargetAmount())
                .autoContribution(dto.getAutoContribution() != null ? dto.getAutoContribution() : false)
                .status(GoalStatus.ACTIVE)
                .startDate(dto.getStartDate())
                .targetDate(dto.getTargetDate())
                .icon(dto.getIcon())
                .build();

        return goalRepository.save(goal);
    }

    @Transactional(readOnly = true)
    public List<Goal> findAll(UUID userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Goal> findByStatus(UUID userId, GoalStatus status) {
        return goalRepository.findByUserIdAndStatus(userId, status);
    }

    @Transactional(readOnly = true)
    public Goal findById(UUID userId, Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta no encontrada con ID: " + id));

        if (!goal.getUserId().equals(userId)) {
            throw new BadRequestException("Esta meta no te pertenece");
        }

        return goal;
    }

    public Goal update(UUID userId, Long id, UpdateGoalDTO dto) {
        Goal goal = findById(userId, id);

        if (goal.getStatus() == GoalStatus.COMPLETED || goal.getStatus() == GoalStatus.CANCELLED) {
            throw new BadRequestException("No se puede modificar una meta en estado " + goal.getStatus());
        }

        if (dto.getName() != null) goal.setName(dto.getName());
        if (dto.getDescription() != null) goal.setDescription(dto.getDescription());
        if (dto.getIcon() != null) goal.setIcon(dto.getIcon());

        if (dto.getTargetAmount() != null) {
            goal.setTargetAmount(dto.getTargetAmount());
        }
        if (dto.getMonthlyTargetAmount() != null) {
            goal.setMonthlyTargetAmount(dto.getMonthlyTargetAmount());
        }
        if (dto.getAutoContribution() != null) {
            validateAutoContributionConfig(dto.getAutoContribution(),
                    dto.getMonthlyTargetAmount() != null ? dto.getMonthlyTargetAmount() : goal.getMonthlyTargetAmount());
            goal.setAutoContribution(dto.getAutoContribution());
        }
        if (dto.getTargetDate() != null) {
            if (dto.getTargetDate().isBefore(goal.getStartDate())) {
                throw new BadRequestException("La fecha objetivo no puede ser anterior a la fecha de inicio");
            }
            goal.setTargetDate(dto.getTargetDate());
        }

        // Transiciones de estado permitidas
        if (dto.getStatus() != null) {
            applyStatusTransition(goal, dto.getStatus());
        }

        return goalRepository.save(goal);
    }

    public void delete(UUID userId, Long id) {
        Goal goal = findById(userId, id);
        goalRepository.delete(goal);
        log.info("Meta eliminada: ID={}, User={}", id, userId);
    }

    // ==================== APORTES ====================

    public GoalContribution addManualContribution(UUID userId, Long goalId, AddContributionDTO dto) {
        Goal goal = findById(userId, goalId);

        if (goal.getStatus() == GoalStatus.CANCELLED) {
            throw new BadRequestException("No se pueden agregar aportes a una meta cancelada");
        }
        if (goal.getStatus() == GoalStatus.COMPLETED) {
            throw new BadRequestException("La meta ya fue completada");
        }

        LocalDateTime contributionDate = dto.getContributionDate() != null
                ? dto.getContributionDate()
                : LocalDateTime.now();

        GoalContribution contribution = GoalContribution.builder()
                .goal(goal)
                .userId(userId)
                .amount(dto.getAmount())
                .contributionDate(contributionDate)
                .year(contributionDate.getYear())
                .month(contributionDate.getMonthValue())
                .type(ContributionType.MANUAL)
                .notes(dto.getNotes())
                .build();

        contribution = contributionRepository.save(contribution);

        // Verificar si la meta se completó con este aporte
        checkAndCompleteGoal(goal);

        return contribution;
    }

    public GoalContribution adjustContribution(UUID userId, Long goalId, AdjustContributionDTO dto) {
        Goal goal = findById(userId, goalId);

        if (goal.getStatus() == GoalStatus.CANCELLED) {
            throw new BadRequestException("No se pueden ajustar aportes de una meta cancelada");
        }

        BigDecimal adjustmentAmount = dto.getIsReduction()
                ? dto.getAmount().negate()
                : dto.getAmount();

        // Validar que el ajuste no deje el total en negativo
        BigDecimal currentTotal = contributionRepository.sumAmountByGoalId(goalId);
        if (currentTotal.add(adjustmentAmount).compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException(
                    "El ajuste dejaría el total acumulado en negativo. Total actual: " + currentTotal);
        }

        LocalDateTime now = LocalDateTime.now();
        GoalContribution adjustment = GoalContribution.builder()
                .goal(goal)
                .userId(userId)
                .amount(adjustmentAmount)
                .contributionDate(now)
                .year(dto.getYear())
                .month(dto.getMonth())
                .type(ContributionType.ADJUSTMENT)
                .notes(dto.getNotes())
                .build();

        adjustment = contributionRepository.save(adjustment);

        // Re-evaluar estado si meta estaba completada y el ajuste es negativo
        if (goal.getStatus() == GoalStatus.COMPLETED && dto.getIsReduction()) {
            BigDecimal newTotal = contributionRepository.sumAmountByGoalId(goalId);
            if (newTotal.compareTo(goal.getTargetAmount()) < 0) {
                goal.setStatus(GoalStatus.ACTIVE);
                goal.setCompletedAt(null);
                goalRepository.save(goal);
                log.info("Meta ID={} volvió a ACTIVE por ajuste negativo", goalId);
            }
        }

        // Si era ACTIVE, verificar si el ajuste la completa
        if (goal.getStatus() == GoalStatus.ACTIVE) {
            checkAndCompleteGoal(goal);
        }

        return adjustment;
    }

    @Transactional(readOnly = true)
    public List<GoalContribution> findContributions(UUID userId, Long goalId) {
        findById(userId, goalId); // valida ownership
        return contributionRepository.findByGoalIdOrderByContributionDateDesc(goalId);
    }

    // ==================== ESTADÍSTICAS ====================

    @Transactional(readOnly = true)
    public GoalStatisticsDTO getStatistics(UUID userId, Long goalId) {
        Goal goal = findById(userId, goalId);
        List<GoalContribution> contributions = contributionRepository.findByGoalIdOrderByContributionDateDesc(goalId);

        BigDecimal totalContributed = contributions.stream()
                .map(GoalContribution::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal progressPct = BigDecimal.ZERO;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progressPct = totalContributed
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Agrupar por año-mes para el breakdown
        Map<String, BigDecimal> byMonth = contributions.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getYear() + "-" + String.format("%02d", c.getMonth()),
                        Collectors.reducing(BigDecimal.ZERO, GoalContribution::getAmount, BigDecimal::add)
                ));

        // Rango de meses desde startDate hasta hoy o completedAt
        LocalDate rangeEnd = goal.getCompletedAt() != null
                ? goal.getCompletedAt().toLocalDate()
                : LocalDate.now();

        List<GoalStatisticsDTO.MonthlyBreakdownDTO> breakdown = buildMonthlyBreakdown(
                goal.getStartDate(), rangeEnd, byMonth, goal.getMonthlyTargetAmount());

        int monthsWithContributions = (int) breakdown.stream()
                .filter(m -> m.getContributed().compareTo(BigDecimal.ZERO) > 0)
                .count();

        int monthsWithFullTarget = 0;
        if (goal.getMonthlyTargetAmount() != null) {
            monthsWithFullTarget = (int) breakdown.stream()
                    .filter(GoalStatisticsDTO.MonthlyBreakdownDTO::getTargetMet)
                    .count();
        }

        BigDecimal avgMonthly = breakdown.isEmpty() ? BigDecimal.ZERO
                : totalContributed.divide(BigDecimal.valueOf(breakdown.size()), 2, RoundingMode.HALF_UP);

        // Mejor y peor mes (solo entre meses con aporte > 0)
        Optional<GoalStatisticsDTO.MonthlyBreakdownDTO> best = breakdown.stream()
                .filter(m -> m.getContributed().compareTo(BigDecimal.ZERO) > 0)
                .max(Comparator.comparing(GoalStatisticsDTO.MonthlyBreakdownDTO::getContributed));

        Optional<GoalStatisticsDTO.MonthlyBreakdownDTO> worst = breakdown.stream()
                .filter(m -> m.getContributed().compareTo(BigDecimal.ZERO) > 0)
                .min(Comparator.comparing(GoalStatisticsDTO.MonthlyBreakdownDTO::getContributed));

        boolean completedOnTime = goal.getStatus() == GoalStatus.COMPLETED
                && goal.getTargetDate() != null
                && goal.getCompletedAt() != null
                && !goal.getCompletedAt().toLocalDate().isAfter(goal.getTargetDate());

        return GoalStatisticsDTO.builder()
                .goalId(goal.getId())
                .goalName(goal.getName())
                .icon(goal.getIcon())
                .status(goal.getStatus())
                .targetAmount(goal.getTargetAmount())
                .totalContributed(totalContributed)
                .progressPercentage(progressPct)
                .startDate(goal.getStartDate())
                .targetDate(goal.getTargetDate())
                .completedAt(goal.getCompletedAt())
                .completedOnTime(completedOnTime)
                .totalMonths(breakdown.size())
                .monthsWithContributions(monthsWithContributions)
                .monthsWithFullTarget(monthsWithFullTarget)
                .averageMonthlyContribution(avgMonthly)
                .monthlyTarget(goal.getMonthlyTargetAmount())
                .monthlyBreakdown(breakdown)
                .bestMonthAmount(best.map(GoalStatisticsDTO.MonthlyBreakdownDTO::getContributed).orElse(null))
                .bestMonthLabel(best.map(GoalStatisticsDTO.MonthlyBreakdownDTO::getMonthLabel).orElse(null))
                .worstMonthAmount(worst.map(GoalStatisticsDTO.MonthlyBreakdownDTO::getContributed).orElse(null))
                .worstMonthLabel(worst.map(GoalStatisticsDTO.MonthlyBreakdownDTO::getMonthLabel).orElse(null))
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    // ==================== MAPEO A DTOs ====================

    public GoalResponseDTO toResponseDTO(Goal goal) {
        BigDecimal currentAmount = contributionRepository.sumAmountByGoalId(goal.getId());

        BigDecimal progressPct = BigDecimal.ZERO;
        BigDecimal remaining = goal.getTargetAmount().subtract(currentAmount);
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progressPct = currentAmount
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .min(BigDecimal.valueOf(100)); // cap en 100%
        }

        Long remainingMonths = null;
        BigDecimal suggestedMonthly = null;
        if (goal.getTargetDate() != null && goal.getStatus() == GoalStatus.ACTIVE) {
            remainingMonths = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getTargetDate());
            if (remainingMonths > 0 && remaining.compareTo(BigDecimal.ZERO) > 0) {
                suggestedMonthly = remaining.divide(BigDecimal.valueOf(remainingMonths), 2, RoundingMode.CEILING);
            }
        }

        return GoalResponseDTO.builder()
                .id(goal.getId())
                .name(goal.getName())
                .description(goal.getDescription())
                .icon(goal.getIcon())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(currentAmount)
                .monthlyTargetAmount(goal.getMonthlyTargetAmount())
                .progressPercentage(progressPct)
                .autoContribution(goal.getAutoContribution())
                .status(goal.getStatus())
                .startDate(goal.getStartDate())
                .targetDate(goal.getTargetDate())
                .completedAt(goal.getCompletedAt())
                .remainingAmount(remaining.max(BigDecimal.ZERO))
                .remainingMonths(remainingMonths)
                .suggestedMonthlyAmount(suggestedMonthly)
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }

    public List<GoalResponseDTO> toResponseDTOList(List<Goal> goals) {
        return goals.stream().map(this::toResponseDTO).toList();
    }

    public ContributionResponseDTO toContributionResponseDTO(GoalContribution c) {
        return ContributionResponseDTO.builder()
                .id(c.getId())
                .goalId(c.getGoal().getId())
                .amount(c.getAmount())
                .contributionDate(c.getContributionDate())
                .year(c.getYear())
                .month(c.getMonth())
                .type(c.getType())
                .notes(c.getNotes())
                .createdAt(c.getCreatedAt())
                .build();
    }

    public List<ContributionResponseDTO> toContributionResponseDTOList(List<GoalContribution> list) {
        return list.stream().map(this::toContributionResponseDTO).toList();
    }

    // ==================== HELPERS PRIVADOS ====================

    /**
     * Registra un aporte automático (llamado por el scheduler).
     * No falla si ya existe un AUTO para ese mes — simplemente lo ignora.
     */
    public void registerAutoContribution(Goal goal) {
        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear();
        int month = now.getMonthValue();

        if (contributionRepository.existsByGoalIdAndYearAndMonthAndType(
                goal.getId(), year, month, ContributionType.AUTO)) {
            log.debug("Aporte AUTO ya registrado para meta={} mes={}/{}", goal.getId(), month, year);
            return;
        }

        GoalContribution contribution = GoalContribution.builder()
                .goal(goal)
                .userId(goal.getUserId())
                .amount(goal.getMonthlyTargetAmount())
                .contributionDate(now)
                .year(year)
                .month(month)
                .type(ContributionType.AUTO)
                .notes("Aporte automático mensual")
                .build();

        contributionRepository.save(contribution);
        checkAndCompleteGoal(goal);

        log.info("Aporte AUTO registrado: meta={}, user={}, monto={}, mes={}/{}",
                goal.getId(), goal.getUserId(), goal.getMonthlyTargetAmount(), month, year);
    }

    private void checkAndCompleteGoal(Goal goal) {
        BigDecimal total = contributionRepository.sumAmountByGoalId(goal.getId());
        if (total.compareTo(goal.getTargetAmount()) >= 0 && goal.getStatus() == GoalStatus.ACTIVE) {
            goal.setStatus(GoalStatus.COMPLETED);
            goal.setCompletedAt(LocalDateTime.now());
            goalRepository.save(goal);
            log.info("✅ Meta completada: ID={}, User={}, Total={}", goal.getId(), goal.getUserId(), total);
        }
    }

    private void applyStatusTransition(Goal goal, GoalStatus newStatus) {
        GoalStatus current = goal.getStatus();
        boolean valid = switch (current) {
            case ACTIVE -> newStatus == GoalStatus.PAUSED || newStatus == GoalStatus.CANCELLED;
            case PAUSED -> newStatus == GoalStatus.ACTIVE || newStatus == GoalStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    "Transición de estado inválida: " + current + " -> " + newStatus);
        }

        goal.setStatus(newStatus);
        if (newStatus == GoalStatus.CANCELLED) {
            goal.setAutoContribution(false);
        }
    }

    private void validateAutoContributionConfig(Boolean autoContribution, BigDecimal monthlyTargetAmount) {
        if (Boolean.TRUE.equals(autoContribution) && monthlyTargetAmount == null) {
            throw new BadRequestException(
                    "Se requiere monthlyTargetAmount para habilitar el aporte automático");
        }
    }

    private List<GoalStatisticsDTO.MonthlyBreakdownDTO> buildMonthlyBreakdown(
            LocalDate start, LocalDate end,
            Map<String, BigDecimal> byMonth,
            BigDecimal monthlyTarget) {

        List<GoalStatisticsDTO.MonthlyBreakdownDTO> breakdown = new ArrayList<>();
        BigDecimal cumulative = BigDecimal.ZERO;
        LocalDate cursor = start.withDayOfMonth(1);
        LocalDate endMonth = end.withDayOfMonth(1);

        while (!cursor.isAfter(endMonth)) {
            String key = cursor.getYear() + "-" + String.format("%02d", cursor.getMonthValue());
            BigDecimal contributed = byMonth.getOrDefault(key, BigDecimal.ZERO);
            cumulative = cumulative.add(contributed);

            boolean targetMet = monthlyTarget != null
                    && contributed.compareTo(monthlyTarget) >= 0;

            String label = Month.of(cursor.getMonthValue())
                    .getDisplayName(java.time.format.TextStyle.FULL, new Locale("es", "ES"))
                    + " " + cursor.getYear();

            breakdown.add(GoalStatisticsDTO.MonthlyBreakdownDTO.builder()
                    .year(cursor.getYear())
                    .month(cursor.getMonthValue())
                    .monthLabel(label)
                    .contributed(contributed)
                    .monthlyTarget(monthlyTarget)
                    .targetMet(targetMet)
                    .cumulativeTotal(cumulative)
                    .build());

            cursor = cursor.plusMonths(1);
        }

        return breakdown;
    }
}