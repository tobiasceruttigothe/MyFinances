package com.myfinances.goals.scheduler;

import com.myfinances.goals.model.Goal;
import com.myfinances.goals.model.GoalStatus;
import com.myfinances.goals.repository.GoalRepository;
import com.myfinances.goals.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Scheduler que registra aportes automáticos el 1ro de cada mes a las 00:05.
 *
 * Solo procesa metas que cumplan TODAS estas condiciones:
 * - status = ACTIVE
 * - autoContribution = true
 * - monthlyTargetAmount != null
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GoalAutoContributionScheduler {

    private final GoalRepository goalRepository;
    private final GoalService goalService;

    /**
     * Corre el día 1 de cada mes a las 00:05 UTC.
     * Cron: segundos minutos horas día-mes mes día-semana
     */
    @Scheduled(cron = "0 5 0 1 * *")
    public void processAutoContributions() {
        log.info("⏰ Iniciando procesamiento de aportes automáticos mensuales...");

        List<Goal> activeAutoGoals = goalRepository.findByStatusAndAutoContributionTrue(GoalStatus.ACTIVE);

        if (activeAutoGoals.isEmpty()) {
            log.info("No hay metas activas con aporte automático. Nada que procesar.");
            return;
        }

        log.info("Procesando {} meta(s) con aporte automático...", activeAutoGoals.size());

        int success = 0;
        int skipped = 0;
        int errors = 0;

        for (Goal goal : activeAutoGoals) {
            if (goal.getMonthlyTargetAmount() == null) {
                log.warn("Meta ID={} tiene autoContribution=true pero monthlyTargetAmount es null. Omitiendo.", goal.getId());
                skipped++;
                continue;
            }

            try {
                goalService.registerAutoContribution(goal);
                success++;
            } catch (Exception e) {
                log.error("Error procesando aporte auto para meta ID={}: {}", goal.getId(), e.getMessage());
                errors++;
            }
        }

        log.info("✅ Aportes automáticos completados: {} OK, {} omitidos, {} errores",
                success, skipped, errors);
    }
}