package com.myfinances.account.controller;

import com.myfinances.account.dto.CategorySummaryDTO;
import com.myfinances.account.dto.MonthlySummaryDTO;
import com.myfinances.account.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * Obtener resumen mensual
     */
    @GetMapping("/monthly")
    public ResponseEntity<MonthlySummaryDTO> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlySummary(year, month));
    }

    /**
     * Obtener gastos por categoría de un mes específico
     */
    @GetMapping("/expenses/by-category")
    public ResponseEntity<List<CategorySummaryDTO>> getExpensesByCategory(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getExpensesByCategory(year, month));
    }

    /**
     * Obtener ingresos por categoría de un mes específico
     */
    @GetMapping("/incomes/by-category")
    public ResponseEntity<List<CategorySummaryDTO>> getIncomesByCategory(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getIncomesByCategory(year, month));
    }

    /**
     * Obtener todos los gastos agrupados por categoría (histórico completo)
     */
    @GetMapping("/expenses/all-by-category")
    public ResponseEntity<CategorySummaryDTO.CategorySummaryResponse> getAllExpensesByCategory() {
        return ResponseEntity.ok(reportService.getAllExpensesByCategory());
    }

    /**
     * Obtener todos los ingresos agrupados por categoría (histórico completo)
     */
    @GetMapping("/incomes/all-by-category")
    public ResponseEntity<CategorySummaryDTO.CategorySummaryResponse> getAllIncomesByCategory() {
        return ResponseEntity.ok(reportService.getAllIncomesByCategory());
    }

    /**
     * Obtener comparativa de los últimos N meses
     */
    @GetMapping("/monthly-comparison")
    public ResponseEntity<List<MonthlySummaryDTO>> getMonthlyComparison(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(reportService.getMonthlyComparison(months));
    }
}

