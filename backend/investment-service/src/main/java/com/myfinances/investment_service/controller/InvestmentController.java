package com.myfinances.investment_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/investments")
public class InvestmentController {

    @GetMapping("/user/{userId}")
    public BigDecimal getTotalInvestment(@PathVariable Long userId) {
        // Simulamos que vamos a una bolsa de valores y tardamos un poco
        // Thread.sleep(100); // Descomentar para simular latencia luego

        // Retornamos un valor fijo por ahora para probar
        return new BigDecimal("15000.00");
    }
}