package com.myfinances.account.service;

import com.myfinances.account.dto.CategorySummaryDTO;
import com.myfinances.account.dto.MonthlySummaryDTO;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.repository.CategoryRepository;
import com.myfinances.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Genera un resumen mensual completo
     */
    public MonthlySummaryDTO getMonthlySummary(UUID userId, int year, int month) {
        log.debug("Generando resumen mensual para usuario={}, año={}, mes={}", userId, year, month);

        List<Transaction> transactions = transactionRepository.findByUserIdAndYearAndMonth(userId, year, month);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        long incomeCount = 0;
        long expenseCount = 0;

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
                incomeCount++;
            } else {
                totalExpense = totalExpense.add(t.getAmount());
                expenseCount++;
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpense);
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = balance.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        String monthName = Month.of(month).getDisplayName(TextStyle.FULL, new Locale("es", "ES"));

        return MonthlySummaryDTO.builder()
                .year(year)
                .month(month)
                .monthName(monthName)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .savingsRate(savingsRate)
                .incomeTransactionCount(incomeCount)
                .expenseTransactionCount(expenseCount)
                .expensesByCategory(getExpensesByCategory(userId, year, month))
                .incomesByCategory(getIncomesByCategory(userId, year, month))
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Obtiene gastos agrupados por categoría para un mes
     */
    public List<CategorySummaryDTO> getExpensesByCategory(UUID userId, int year, int month) {
        return getSummaryByTypeAndMonth(userId, TransactionType.EXPENSE, year, month);
    }

    /**
     * Obtiene ingresos agrupados por categoría para un mes
     */
    public List<CategorySummaryDTO> getIncomesByCategory(UUID userId, int year, int month) {
        return getSummaryByTypeAndMonth(userId, TransactionType.INCOME, year, month);
    }

    private List<CategorySummaryDTO> getSummaryByTypeAndMonth(UUID userId, TransactionType type, int year, int month) {
        log.debug("Generando resumen por categoría tipo={} para usuario={}, {}/{}", type, userId, month, year);

        List<Transaction> transactions = transactionRepository.findByUserIdAndYearAndMonth(userId, year, month);

        // ⭐ MEJORA: Filtrar y agrupar en una sola pasada (más eficiente)
        Map<Long, List<Transaction>> transactionsByCategory = transactions.stream()
                .filter(t -> t.getType() == type && t.getCategory() != null)
                .collect(Collectors.groupingBy(t -> t.getCategory().getId()));

        // Calcular el total general
        BigDecimal grandTotal = transactionsByCategory.values().stream()
                .flatMap(List::stream)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategorySummaryDTO> summaries = new ArrayList<>();

        for (Map.Entry<Long, List<Transaction>> entry : transactionsByCategory.entrySet()) {
            Long categoryId = entry.getKey();
            List<Transaction> categoryTransactions = entry.getValue();

            BigDecimal categoryTotal = categoryTransactions.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long count = categoryTransactions.size();

            // Obtener el nombre de la categoría del primer elemento
            String categoryName = categoryTransactions.get(0).getCategory().getName();

            BigDecimal percentage = BigDecimal.ZERO;
            if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                percentage = categoryTotal.divide(grandTotal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            summaries.add(CategorySummaryDTO.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .totalAmount(categoryTotal)
                    .transactionCount(count)
                    .percentage(percentage)
                    .build());
        }

        summaries.sort((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()));
        return summaries;
    }

    /**
     * Obtiene el resumen de gastos por categoría (todo el tiempo)
     */
    public CategorySummaryDTO.CategorySummaryResponse getAllExpensesByCategory(UUID userId) {
        return getSummaryByType(userId, TransactionType.EXPENSE);
    }

    /**
     * Obtiene el resumen de ingresos por categoría (todo el tiempo)
     */
    public CategorySummaryDTO.CategorySummaryResponse getAllIncomesByCategory(UUID userId) {
        return getSummaryByType(userId, TransactionType.INCOME);
    }

    private CategorySummaryDTO.CategorySummaryResponse getSummaryByType(UUID userId, TransactionType type) {
        log.debug("Generando resumen histórico por categoría tipo={} para usuario={}", type, userId);

        List<Transaction> transactions = transactionRepository.findByUserIdAndType(userId, type);

        // ⭐ MEJORA: Agrupar por categoría en una sola pasada
        Map<Long, List<Transaction>> transactionsByCategory = transactions.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(t -> t.getCategory().getId()));

        BigDecimal grandTotal = transactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategorySummaryDTO> summaries = new ArrayList<>();

        for (Map.Entry<Long, List<Transaction>> entry : transactionsByCategory.entrySet()) {
            Long categoryId = entry.getKey();
            List<Transaction> categoryTransactions = entry.getValue();

            BigDecimal categoryTotal = categoryTransactions.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long count = categoryTransactions.size();
            String categoryName = categoryTransactions.get(0).getCategory().getName();

            BigDecimal percentage = BigDecimal.ZERO;
            if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                percentage = categoryTotal.divide(grandTotal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            summaries.add(CategorySummaryDTO.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .totalAmount(categoryTotal)
                    .transactionCount(count)
                    .percentage(percentage)
                    .build());
        }

        summaries.sort((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()));

        log.debug("Resumen generado: {} categorías con total={}", summaries.size(), grandTotal);

        return CategorySummaryDTO.CategorySummaryResponse.builder()
                .categories(summaries)
                .grandTotal(grandTotal)
                .build();
    }

    /**
     * Obtiene comparativa de los últimos N meses
     */
    public List<MonthlySummaryDTO> getMonthlyComparison(UUID userId, int months) {
        log.debug("Generando comparativa de {} meses para usuario={}", months, userId);

        List<MonthlySummaryDTO> comparison = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < months; i++) {
            LocalDateTime date = now.minusMonths(i);
            comparison.add(getMonthlySummary(userId, date.getYear(), date.getMonthValue()));
        }

        return comparison;
    }
}