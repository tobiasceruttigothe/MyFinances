package com.myfinances.account.controller;

import com.myfinances.account.client.InvestmentClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final InvestmentClient investmentClient;
    // Inyectar repository de transacciones si quieres sumar saldo real

    @GetMapping("/summary/{userId}")
    @CircuitBreaker(name = "investmentBreaker", fallbackMethod = "fallbackInvestment")
    public ResponseEntity<Map<String, Object>> getUserSummary(@PathVariable Long userId) {

        // 1. Llamada remota (puede fallar)
        BigDecimal totalInvestments = investmentClient.getTotalInvestmentByUserId(userId);

        // 2. Lógica local (ejemplo)
        BigDecimal accountBalance = new BigDecimal("5000.00"); // Aquí llamarías a tu servicio de saldo real

        Map<String, Object> response = new HashMap<>();
        response.put("accountBalance", accountBalance);
        response.put("investments", totalInvestments);
        response.put("netWorth", accountBalance.add(totalInvestments));

        return ResponseEntity.ok(response);
    }

    // Método de respaldo si investment-service falla
    public ResponseEntity<Map<String, Object>> fallbackInvestment(Long userId, Throwable t) {
        Map<String, Object> response = new HashMap<>();
        response.put("accountBalance", new BigDecimal("5000.00"));
        response.put("investments", BigDecimal.ZERO); // Asumimos 0 si no podemos conectar
        response.put("netWorth", new BigDecimal("5000.00"));
        response.put("message", "Investment service is currently unavailable.");

        return ResponseEntity.ok(response);
    }
}