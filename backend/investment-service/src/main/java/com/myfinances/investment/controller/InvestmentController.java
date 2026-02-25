package com.myfinances.investment.controller;

import com.myfinances.investment.dto.*;
import com.myfinances.investment.model.Investment;
import com.myfinances.investment.service.InvestmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * ⭐ IMPORTANTE: El userId viene del header X-User-Id que pone el Gateway
 */
@RestController
@RequestMapping("/api/v1/investments")
@RequiredArgsConstructor
@Slf4j
public class InvestmentController {

    private final InvestmentService service;

    /**
     * Crear una nueva inversión
     */
    @PostMapping
    public ResponseEntity<InvestmentResponseDTO> create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateInvestmentDTO dto) {

        log.debug("POST /investments - userId={}, tipo={}, capital={}", userId, dto.getType(), dto.getInitialCapital());
        Investment investment = service.create(userId, dto);
        log.debug("Inversión creada exitosamente: ID={}", investment.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.toResponseDTO(investment));
    }

    /**
     * Obtener todas las inversiones del usuario
     */
    @GetMapping
    public ResponseEntity<List<InvestmentResponseDTO>> getAll(@RequestHeader("X-User-Id") UUID userId) {
        log.debug("GET /investments - userId={}", userId);
        return ResponseEntity.ok(service.toResponseDTOList(service.findAll(userId)));
    }

    /**
     * Obtener una inversión por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InvestmentResponseDTO> getById(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        log.debug("GET /investments/{} - userId={}", id, userId);
        return ResponseEntity.ok(service.toResponseDTO(service.findById(userId, id)));
    }

    /**
     * Obtener inversiones por tipo
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<InvestmentResponseDTO>> getByType(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String type) {
        log.debug("GET /investments/type/{} - userId={}", type, userId);
        return ResponseEntity.ok(service.toResponseDTOList(service.findByType(userId, type)));
    }

    /**
     * Actualizar una inversión
     */
    @PutMapping("/{id}")
    public ResponseEntity<InvestmentResponseDTO> update(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateInvestmentDTO dto) {

        log.debug("PUT /investments/{} - userId={}", id, userId);
        Investment investment = service.update(userId, id, dto);
        log.debug("Inversión actualizada: ID={}", id);
        return ResponseEntity.ok(service.toResponseDTO(investment));
    }

    /**
     * Eliminar una inversión
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        log.debug("DELETE /investments/{} - userId={}", id, userId);
        service.delete(userId, id);
        log.debug("Inversión eliminada: ID={}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * ⭐ ENDPOINT ESPECIAL: Obtener valor total de inversiones
     * Este endpoint es llamado por account-service vía Feign
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<BigDecimal> getTotalInvestmentByUserId(@PathVariable UUID userId) {
        log.debug("GET /investments/user/{} - Obteniendo total de inversiones", userId);
        BigDecimal total = service.getTotalInvestmentValue(userId);
        log.debug("Total inversiones para usuario {}: {}", userId, total);
        return ResponseEntity.ok(total);
    }

    /**
     * Obtener resumen del portfolio
     */
    @GetMapping("/portfolio/summary")
    public ResponseEntity<PortfolioSummaryDTO> getPortfolioSummary(@RequestHeader("X-User-Id") UUID userId) {
        log.debug("GET /investments/portfolio/summary - userId={}", userId);
        return ResponseEntity.ok(service.getPortfolioSummary(userId));
    }

    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.debug("GET /investments/health");
        return ResponseEntity.ok("Investment Service is UP");
    }
}