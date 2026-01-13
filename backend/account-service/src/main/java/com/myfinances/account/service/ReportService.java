package com.myfinances.account.service;

import com.myfinances.account.dto.CategorySummaryDTO;
import com.myfinances.account.dto.MonthlySummaryDTO;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.repository.CategoryRepository;
import com.myfinances.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Genera un resumen mensual completo
     */
    public MonthlySummaryDTO getMonthlySummary(int year, int month) {
        List<Transaction> transactions = transactionRepository.findByYearAndMonth(year, month);

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
                .expensesByCategory(getExpensesByCategory(year, month))
                .incomesByCategory(getIncomesByCategory(year, month))
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Obtiene gastos agrupados por categoría para un mes
     */
    public List<CategorySummaryDTO> getExpensesByCategory(int year, int month) {
        return getSummaryByTypeAndMonth(TransactionType.EXPENSE, year, month);
    }

    /**
     * Obtiene ingresos agrupados por categoría para un mes
     */
    public List<CategorySummaryDTO> getIncomesByCategory(int year, int month) {
        return getSummaryByTypeAndMonth(TransactionType.INCOME, year, month);
    }

    private List<CategorySummaryDTO> getSummaryByTypeAndMonth(TransactionType type, int year, int month) {
        List<Transaction> transactions = transactionRepository.findByYearAndMonth(year, month);
        List<CategoryType> categories = categoryRepository.findAll();

        BigDecimal grandTotal = transactions.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategorySummaryDTO> summaries = new ArrayList<>();

        for (CategoryType category : categories) {
            BigDecimal categoryTotal = transactions.stream()
                    .filter(t -> t.getType() == type && t.getCategory() != null && t.getCategory().getId().equals(category.getId()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long count = transactions.stream()
                    .filter(t -> t.getType() == type && t.getCategory() != null && t.getCategory().getId().equals(category.getId()))
                    .count();

            if (count > 0) {
                BigDecimal percentage = BigDecimal.ZERO;
                if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                    percentage = categoryTotal.divide(grandTotal, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                }

                summaries.add(CategorySummaryDTO.builder()
                        .categoryId(category.getId())
                        .categoryName(category.getName())
                        .totalAmount(categoryTotal)
                        .transactionCount(count)
                        .percentage(percentage)
                        .build());
            }
        }

        summaries.sort((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()));
        return summaries;
    }

    /**
     * Obtiene el resumen de gastos por categoría (todo el tiempo)
     */
    public CategorySummaryDTO.CategorySummaryResponse getAllExpensesByCategory() {
        return getSummaryByType(TransactionType.EXPENSE);
    }

    /**
     * Obtiene el resumen de ingresos por categoría (todo el tiempo)
     */
    public CategorySummaryDTO.CategorySummaryResponse getAllIncomesByCategory() {
        return getSummaryByType(TransactionType.INCOME);
    }

    private CategorySummaryDTO.CategorySummaryResponse getSummaryByType(TransactionType type) {
        List<Transaction> transactions = transactionRepository.findByType(type);
        List<CategoryType> categories = categoryRepository.findAll();

        BigDecimal grandTotal = transactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategorySummaryDTO> summaries = new ArrayList<>();

        for (CategoryType category : categories) {
            BigDecimal categoryTotal = transactions.stream()
                    .filter(t -> t.getCategory() != null && t.getCategory().getId().equals(category.getId()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long count = transactions.stream()
                    .filter(t -> t.getCategory() != null && t.getCategory().getId().equals(category.getId()))
                    .count();

            if (count > 0) {
                BigDecimal percentage = BigDecimal.ZERO;
                if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                    percentage = categoryTotal.divide(grandTotal, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                }

                summaries.add(CategorySummaryDTO.builder()
                        .categoryId(category.getId())
                        .categoryName(category.getName())
                        .totalAmount(categoryTotal)
                        .transactionCount(count)
                        .percentage(percentage)
                        .build());
            }
        }

        summaries.sort((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()));

        return CategorySummaryDTO.CategorySummaryResponse.builder()
                .categories(summaries)
                .grandTotal(grandTotal)
                .build();
    }

    /**
     * Obtiene comparativa de los últimos N meses
     */
    public List<MonthlySummaryDTO> getMonthlyComparison(int months) {
        List<MonthlySummaryDTO> comparison = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < months; i++) {
            LocalDateTime date = now.minusMonths(i);
            comparison.add(getMonthlySummary(date.getYear(), date.getMonthValue()));
        }

        return comparison;
    }
}
