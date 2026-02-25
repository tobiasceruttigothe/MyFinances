package com.myfinances.account.controller;

import com.myfinances.account.dto.CategorySummaryDTO;
import com.myfinances.account.dto.MonthlySummaryDTO;
import com.myfinances.account.exception.BadRequestException;
import com.myfinances.account.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    /**
     * Obtener resumen mensual
     */
    @GetMapping("/monthly")
    public ResponseEntity<MonthlySummaryDTO> getMonthlySummary(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam int year,
            @RequestParam int month) {

        log.debug("GET /reports/monthly - userId={}, año={}, mes={}", userId, year, month);

        // ⭐ Validaciones
        if (month < 1 || month > 12) {
            throw new BadRequestException("El mes debe estar entre 1 y 12");
        }
        if (year < 1900 || year > 2100) {
            throw new BadRequestException("El año debe estar entre 1900 y 2100");
        }

        return ResponseEntity.ok(reportService.getMonthlySummary(userId, year, month));
    }

    /**
     * Obtener gastos por categoría de un mes específico
     */
    @GetMapping("/expenses/by-category")
    public ResponseEntity<List<CategorySummaryDTO>> getExpensesByCategory(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam int year,
            @RequestParam int month) {

        log.debug("GET /reports/expenses/by-category - userId={}, año={}, mes={}", userId, year, month);

        // ⭐ Validaciones
        if (month < 1 || month > 12) {
            throw new BadRequestException("El mes debe estar entre 1 y 12");
        }
        if (year < 1900 || year > 2100) {
            throw new BadRequestException("El año debe estar entre 1900 y 2100");
        }

        return ResponseEntity.ok(reportService.getExpensesByCategory(userId, year, month));
    }

    /**
     * Obtener ingresos por categoría de un mes específico
     */
    @GetMapping("/incomes/by-category")
    public ResponseEntity<List<CategorySummaryDTO>> getIncomesByCategory(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam int year,
            @RequestParam int month) {

        log.debug("GET /reports/incomes/by-category - userId={}, año={}, mes={}", userId, year, month);

        // ⭐ Validaciones
        if (month < 1 || month > 12) {
            throw new BadRequestException("El mes debe estar entre 1 y 12");
        }
        if (year < 1900 || year > 2100) {
            throw new BadRequestException("El año debe estar entre 1900 y 2100");
        }

        return ResponseEntity.ok(reportService.getIncomesByCategory(userId, year, month));
    }

    /**
     * Obtener todos los gastos agrupados por categoría (histórico completo)
     */
    @GetMapping("/expenses/all-by-category")
    public ResponseEntity<CategorySummaryDTO.CategorySummaryResponse> getAllExpensesByCategory(
            @RequestHeader("X-User-Id") UUID userId) {
        log.debug("GET /reports/expenses/all-by-category - userId={}", userId);
        return ResponseEntity.ok(reportService.getAllExpensesByCategory(userId));
    }

    /**
     * Obtener todos los ingresos agrupados por categoría (histórico completo)
     */
    @GetMapping("/incomes/all-by-category")
    public ResponseEntity<CategorySummaryDTO.CategorySummaryResponse> getAllIncomesByCategory(
            @RequestHeader("X-User-Id") UUID userId) {
        log.debug("GET /reports/incomes/all-by-category - userId={}", userId);
        return ResponseEntity.ok(reportService.getAllIncomesByCategory(userId));
    }

    /**
     * Obtener comparativa de los últimos N meses
     */
    @GetMapping("/monthly-comparison")
    public ResponseEntity<List<MonthlySummaryDTO>> getMonthlyComparison(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(defaultValue = "6") int months) {

        log.debug("GET /reports/monthly-comparison - userId={}, meses={}", userId, months);

        // ⭐ Validación
        if (months < 1 || months > 24) {
            throw new BadRequestException("El número de meses debe estar entre 1 y 24");
        }

        return ResponseEntity.ok(reportService.getMonthlyComparison(userId, months));
    }
}