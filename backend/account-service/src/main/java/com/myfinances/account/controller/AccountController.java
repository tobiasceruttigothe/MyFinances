package com.myfinances.account.controller;

import com.myfinances.account.client.InvestmentClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
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
public class AccountController {

    private final InvestmentClient investmentClient;

    /**
     * Obtener resumen completo del usuario (balance + inversiones)
     */
    @GetMapping("/summary")
    @CircuitBreaker(name = "investmentBreaker", fallbackMethod = "fallbackSummary")
    public ResponseEntity<Map<String, Object>> getUserSummary(@RequestHeader("X-User-Id") UUID userId) {

        // 1. Llamada remota a investment-service (puede fallar)
        BigDecimal totalInvestments = investmentClient.getTotalInvestmentByUserId(userId);

        // 2. Aquí llamarías a TransactionService para obtener el balance real
        // Por ahora mock:
        BigDecimal accountBalance = new BigDecimal("5000.00");

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId.toString());
        response.put("accountBalance", accountBalance);
        response.put("investments", totalInvestments);
        response.put("netWorth", accountBalance.add(totalInvestments));

        return ResponseEntity.ok(response);
    }

    /**
     * Método de respaldo si investment-service falla
     */
    public ResponseEntity<Map<String, Object>> fallbackSummary(UUID userId, Throwable t) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId.toString());
        response.put("accountBalance", new BigDecimal("5000.00"));
        response.put("investments", BigDecimal.ZERO);
        response.put("netWorth", new BigDecimal("5000.00"));
        response.put("message", "Investment service is currently unavailable.");

        return ResponseEntity.ok(response);
    }
}