package com.myfinances.account.controller;

import com.myfinances.account.client.InvestmentClient;
import com.myfinances.account.service.TransactionService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * ⭐ Controller para resumen de cuenta (combina account-service + investment-service)
 */
@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Slf4j
public class AccountController {

    private final InvestmentClient investmentClient;
    private final TransactionService transactionService;

    /**
     * Obtener resumen completo del usuario (balance + inversiones)
     */
    @GetMapping("/summary")
    @CircuitBreaker(name = "investmentBreaker", fallbackMethod = "fallbackSummary")
    public ResponseEntity<Map<String, Object>> getUserSummary(@RequestHeader("X-User-Id") UUID userId) {
        log.debug("GET /accounts/summary - userId={}", userId);

        // 1. Llamada remota a investment-service (puede fallar)
        log.debug("Llamando a investment-service para obtener total de inversiones");
        BigDecimal totalInvestments = investmentClient.getTotalInvestmentByUserId(userId);
        log.debug("Total inversiones obtenido: {}", totalInvestments);

        // 2. Obtener el balance real desde TransactionService
        BigDecimal accountBalance = transactionService.calculateBalance(userId).getBalance();

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId.toString());
        response.put("accountBalance", accountBalance);
        response.put("investments", totalInvestments);
        response.put("netWorth", accountBalance.add(totalInvestments));

        log.debug("Resumen de cuenta generado para usuario: {}", userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    /**
     * Método de respaldo si investment-service falla
     */
    public ResponseEntity<Map<String, Object>> fallbackSummary(UUID userId, Throwable t) {
        log.warn("Fallback activado para usuario {}: investment-service no disponible. Error: {}", userId, t.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId.toString());
        response.put("accountBalance", BigDecimal.ZERO);
        response.put("investments", BigDecimal.ZERO);
        response.put("netWorth", BigDecimal.ZERO);
        response.put("message", "Investment service is currently unavailable.");

        return ResponseEntity.ok(response);
    }
}