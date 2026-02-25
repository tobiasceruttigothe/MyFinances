package com.myfinances.account.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.myfinances.account.dto.CategoryResponseDTO;
import com.myfinances.account.dto.CategorySummaryDTO;
import com.myfinances.account.dto.MonthlySummaryDTO;
import com.myfinances.account.exception.BadRequestException;
import com.myfinances.account.exception.GlobalExceptionHandler;
import com.myfinances.account.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    private UUID userId;
    private MonthlySummaryDTO sampleMonthlySummary;
    private CategorySummaryDTO sampleCategorySummary;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reportController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        userId = UUID.randomUUID();

        sampleCategorySummary = CategorySummaryDTO.builder()
                .categoryId(1L)
                .categoryName("ALIMENTACION")
                .totalAmount(new BigDecimal("1500.00"))
                .transactionCount(15L)
                .percentage(new BigDecimal("30.00"))
                .build();

        sampleMonthlySummary = MonthlySummaryDTO.builder()
                .year(2024)
                .month(6)
                .monthName("junio")
                .totalIncome(new BigDecimal("10000.00"))
                .totalExpense(new BigDecimal("5000.00"))
                .balance(new BigDecimal("5000.00"))
                .savingsRate(new BigDecimal("50.00"))
                .incomeTransactionCount(5L)
                .expenseTransactionCount(20L)
                .expensesByCategory(Arrays.asList(sampleCategorySummary))
                .incomesByCategory(Collections.emptyList())
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    // ==================== GET /api/v1/reports/monthly ====================
    @Nested
    @DisplayName("GET /api/v1/reports/monthly - Resumen mensual")
    class GetMonthlySummary {

        @Test
        @DisplayName("✅ 200 - Obtener resumen mensual")
        void getMonthlySummary_Success() throws Exception {
            when(reportService.getMonthlySummary(userId, 2024, 6))
                    .thenReturn(sampleMonthlySummary);

            mockMvc.perform(get("/api/v1/reports/monthly")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2024")
                            .param("month", "6"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.year").value(2024))
                    .andExpect(jsonPath("$.month").value(6))
                    .andExpect(jsonPath("$.totalIncome").value(10000.00))
                    .andExpect(jsonPath("$.totalExpense").value(5000.00))
                    .andExpect(jsonPath("$.balance").value(5000.00))
                    .andExpect(jsonPath("$.savingsRate").value(50.00));
        }

        @Test
        @DisplayName("✅ 200 - Resumen mensual sin transacciones")
        void getMonthlySummary_Empty() throws Exception {
            MonthlySummaryDTO emptySummary = MonthlySummaryDTO.builder()
                    .year(2024)
                    .month(6)
                    .monthName("junio")
                    .totalIncome(BigDecimal.ZERO)
                    .totalExpense(BigDecimal.ZERO)
                    .balance(BigDecimal.ZERO)
                    .savingsRate(BigDecimal.ZERO)
                    .incomeTransactionCount(0L)
                    .expenseTransactionCount(0L)
                    .expensesByCategory(Collections.emptyList())
                    .incomesByCategory(Collections.emptyList())
                    .calculatedAt(LocalDateTime.now())
                    .build();

            when(reportService.getMonthlySummary(userId, 2024, 6))
                    .thenReturn(emptySummary);

            mockMvc.perform(get("/api/v1/reports/monthly")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2024")
                            .param("month", "6"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalIncome").value(0))
                    .andExpect(jsonPath("$.totalExpense").value(0));
        }

        @Test
        @DisplayName("❌ 400 - Mes inválido (13)")
        void getMonthlySummary_InvalidMonth13() throws Exception {
            mockMvc.perform(get("/api/v1/reports/monthly")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2024")
                            .param("month", "13"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Mes inválido (0)")
        void getMonthlySummary_InvalidMonth0() throws Exception {
            mockMvc.perform(get("/api/v1/reports/monthly")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2024")
                            .param("month", "0"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Mes inválido (-1)")
        void getMonthlySummary_InvalidMonthNegative() throws Exception {
            mockMvc.perform(get("/api/v1/reports/monthly")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2024")
                            .param("month", "-1"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Año inválido (1899)")
        void getMonthlySummary_InvalidYearTooOld() throws Exception {
            mockMvc.perform(get("/api/v1/reports/monthly")
                            .header("X-User-Id", userId.toString())
                            .param("year", "1899")
                            .param("month", "6"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Año inválido (2101)")
        void getMonthlySummary_InvalidYearTooFar() throws Exception {
            mockMvc.perform(get("/api/v1/reports/monthly")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2101")
                            .param("month", "6"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /api/v1/reports/expenses/by-category ====================
    @Nested
    @DisplayName("GET /api/v1/reports/expenses/by-category - Gastos por categoría")
    class GetExpensesByCategory {

        @Test
        @DisplayName("✅ 200 - Obtener gastos por categoría")
        void getExpensesByCategory_Success() throws Exception {
            List<CategorySummaryDTO> summaries = Arrays.asList(sampleCategorySummary);

            when(reportService.getExpensesByCategory(userId, 2024, 6))
                    .thenReturn(summaries);

            mockMvc.perform(get("/api/v1/reports/expenses/by-category")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2024")
                            .param("month", "6"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].categoryName").value("ALIMENTACION"))
                    .andExpect(jsonPath("$[0].totalAmount").value(1500.00));
        }

        @Test
        @DisplayName("❌ 400 - Mes inválido")
        void getExpensesByCategory_InvalidMonth() throws Exception {
            mockMvc.perform(get("/api/v1/reports/expenses/by-category")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2024")
                            .param("month", "15"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /api/v1/reports/incomes/by-category ====================
    @Nested
    @DisplayName("GET /api/v1/reports/incomes/by-category - Ingresos por categoría")
    class GetIncomesByCategory {

        @Test
        @DisplayName("✅ 200 - Obtener ingresos por categoría")
        void getIncomesByCategory_Success() throws Exception {
            CategorySummaryDTO incomeSummary = CategorySummaryDTO.builder()
                    .categoryId(10L)
                    .categoryName("SALARIO")
                    .totalAmount(new BigDecimal("8000.00"))
                    .transactionCount(1L)
                    .percentage(new BigDecimal("80.00"))
                    .build();

            when(reportService.getIncomesByCategory(userId, 2024, 6))
                    .thenReturn(Arrays.asList(incomeSummary));

            mockMvc.perform(get("/api/v1/reports/incomes/by-category")
                            .header("X-User-Id", userId.toString())
                            .param("year", "2024")
                            .param("month", "6"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].categoryName").value("SALARIO"));
        }

        @Test
        @DisplayName("❌ 400 - Año inválido")
        void getIncomesByCategory_InvalidYear() throws Exception {
            mockMvc.perform(get("/api/v1/reports/incomes/by-category")
                            .header("X-User-Id", userId.toString())
                            .param("year", "1800")
                            .param("month", "6"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /api/v1/reports/expenses/all-by-category ====================
    @Nested
    @DisplayName("GET /api/v1/reports/expenses/all-by-category - Todos los gastos por categoría")
    class GetAllExpensesByCategory {

        @Test
        @DisplayName("✅ 200 - Obtener todos los gastos históricos por categoría")
        void getAllExpensesByCategory_Success() throws Exception {
            CategorySummaryDTO.CategorySummaryResponse response = CategorySummaryDTO.CategorySummaryResponse.builder()
                    .categories(Arrays.asList(sampleCategorySummary))
                    .grandTotal(new BigDecimal("5000.00"))
                    .build();

            when(reportService.getAllExpensesByCategory(userId))
                    .thenReturn(response);

            mockMvc.perform(get("/api/v1/reports/expenses/all-by-category")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.grandTotal").value(5000.00))
                    .andExpect(jsonPath("$.categories").isArray());
        }
    }

    // ==================== GET /api/v1/reports/incomes/all-by-category ====================
    @Nested
    @DisplayName("GET /api/v1/reports/incomes/all-by-category - Todos los ingresos por categoría")
    class GetAllIncomesByCategory {

        @Test
        @DisplayName("✅ 200 - Obtener todos los ingresos históricos por categoría")
        void getAllIncomesByCategory_Success() throws Exception {
            CategorySummaryDTO incomeSummary = CategorySummaryDTO.builder()
                    .categoryId(10L)
                    .categoryName("SALARIO")
                    .totalAmount(new BigDecimal("50000.00"))
                    .transactionCount(6L)
                    .percentage(new BigDecimal("90.00"))
                    .build();

            CategorySummaryDTO.CategorySummaryResponse response = CategorySummaryDTO.CategorySummaryResponse.builder()
                    .categories(Arrays.asList(incomeSummary))
                    .grandTotal(new BigDecimal("55000.00"))
                    .build();

            when(reportService.getAllIncomesByCategory(userId))
                    .thenReturn(response);

            mockMvc.perform(get("/api/v1/reports/incomes/all-by-category")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.grandTotal").value(55000.00));
        }
    }

    // ==================== GET /api/v1/reports/monthly-comparison ====================
    @Nested
    @DisplayName("GET /api/v1/reports/monthly-comparison - Comparativa mensual")
    class GetMonthlyComparison {

        @Test
        @DisplayName("✅ 200 - Obtener comparativa de 6 meses (default)")
        void getMonthlyComparison_Default() throws Exception {
            List<MonthlySummaryDTO> comparisons = Arrays.asList(
                    sampleMonthlySummary,
                    sampleMonthlySummary,
                    sampleMonthlySummary
            );

            when(reportService.getMonthlyComparison(userId, 6))
                    .thenReturn(comparisons);

            mockMvc.perform(get("/api/v1/reports/monthly-comparison")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("✅ 200 - Obtener comparativa de 12 meses")
        void getMonthlyComparison_12Months() throws Exception {
            when(reportService.getMonthlyComparison(userId, 12))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/reports/monthly-comparison")
                            .header("X-User-Id", userId.toString())
                            .param("months", "12"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("❌ 400 - Meses inválido (0)")
        void getMonthlyComparison_InvalidMonths0() throws Exception {
            mockMvc.perform(get("/api/v1/reports/monthly-comparison")
                            .header("X-User-Id", userId.toString())
                            .param("months", "0"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Meses inválido (25)")
        void getMonthlyComparison_InvalidMonths25() throws Exception {
            mockMvc.perform(get("/api/v1/reports/monthly-comparison")
                            .header("X-User-Id", userId.toString())
                            .param("months", "25"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Meses negativo")
        void getMonthlyComparison_NegativeMonths() throws Exception {
            mockMvc.perform(get("/api/v1/reports/monthly-comparison")
                            .header("X-User-Id", userId.toString())
                            .param("months", "-5"))
                    .andExpect(status().isBadRequest());
        }
    }
}
