package com.myfinances.goals.controller;

import com.myfinances.goals.dto.*;
import com.myfinances.goals.model.GoalStatus;
import com.myfinances.goals.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * El userId viene del header X-User-Id que inyecta el Gateway tras validar el JWT.
 */
@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    // ==================== CRUD DE METAS ====================

    @PostMapping
    public ResponseEntity<GoalResponseDTO> create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateGoalDTO dto) {

        var goal = goalService.create(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(goalService.toResponseDTO(goal));
    }

    @GetMapping
    public ResponseEntity<List<GoalResponseDTO>> getAll(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(goalService.toResponseDTOList(goalService.findAll(userId)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<GoalResponseDTO>> getByStatus(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable GoalStatus status) {
        return ResponseEntity.ok(goalService.toResponseDTOList(goalService.findByStatus(userId, status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponseDTO> getById(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(goalService.toResponseDTO(goalService.findById(userId, id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponseDTO> update(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateGoalDTO dto) {

        var goal = goalService.update(userId, id, dto);
        return ResponseEntity.ok(goalService.toResponseDTO(goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        goalService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    // ==================== APORTES ====================

    /**
     * Agregar un aporte manual a una meta
     */
    @PostMapping("/{id}/contributions")
    public ResponseEntity<ContributionResponseDTO> addContribution(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id,
            @Valid @RequestBody AddContributionDTO dto) {

        var contribution = goalService.addManualContribution(userId, id, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.toContributionResponseDTO(contribution));
    }

    /**
     * Ajustar/corregir el aporte de un mes específico.
     * Sirve tanto para registrar que se usó parte del dinero ahorrado
     * como para corregir un aporte automático que no refleja la realidad.
     */
    @PostMapping("/{id}/contributions/adjust")
    public ResponseEntity<ContributionResponseDTO> adjustContribution(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id,
            @Valid @RequestBody AdjustContributionDTO dto) {

        var adjustment = goalService.adjustContribution(userId, id, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.toContributionResponseDTO(adjustment));
    }

    /**
     * Ver historial completo de aportes de una meta
     */
    @GetMapping("/{id}/contributions")
    public ResponseEntity<List<ContributionResponseDTO>> getContributions(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                goalService.toContributionResponseDTOList(goalService.findContributions(userId, id)));
    }

    // ==================== ESTADÍSTICAS ====================

    /**
     * Estadísticas completas de una meta con breakdown mensual
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<GoalStatisticsDTO> getStatistics(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(goalService.getStatistics(userId, id));
    }

    // ==================== HEALTH ====================

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Goals Service is UP");
    }
}