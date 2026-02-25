package com.myfinances.account.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.myfinances.account.dto.CreateTransactionDTO;
import com.myfinances.account.dto.TransactionResponseDTO;
import com.myfinances.account.dto.UpdateTransactionDTO;
import com.myfinances.account.exception.AccessDeniedException;
import com.myfinances.account.exception.BadRequestException;
import com.myfinances.account.exception.GlobalExceptionHandler;
import com.myfinances.account.exception.ResourceNotFoundException;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private TransactionController transactionController;

    private UUID userId;
    private Transaction sampleTransaction;
    private TransactionResponseDTO sampleResponseDTO;
    private CategoryType sampleCategory;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(transactionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        userId = UUID.randomUUID();

        sampleCategory = CategoryType.builder()
                .id(1L)
                .name("ALIMENTACION")
                .type(TransactionType.EXPENSE)
                .userId(userId)
                .build();

        sampleTransaction = Transaction.builder()
                .id(1L)
                .userId(userId)
                .description("Compra supermercado")
                .amount(new BigDecimal("150.50"))
                .type(TransactionType.EXPENSE)
                .category(sampleCategory)
                .date(LocalDateTime.now())
                .notes("Compra semanal")
                .linkedToInvestment(false)
                .build();

        sampleResponseDTO = TransactionResponseDTO.builder()
                .id(1L)
                .description("Compra supermercado")
                .amount(new BigDecimal("150.50"))
                .type(TransactionType.EXPENSE)
                .categoryId(1L)
                .categoryName("ALIMENTACION")
                .date(LocalDateTime.now())
                .notes("Compra semanal")
                .linkedToInvestment(false)
                .build();
    }

    // ==================== POST /api/v1/transactions ====================
    @Nested
    @DisplayName("POST /api/v1/transactions - Crear transacción")
    class CreateTransaction {

        @Test
        @DisplayName("✅ 201 - Crear transacción exitosamente")
        void createTransaction_Success() throws Exception {
            CreateTransactionDTO dto = CreateTransactionDTO.builder()
                    .description("Compra supermercado")
                    .amount(new BigDecimal("150.50"))
                    .type(TransactionType.EXPENSE)
                    .categoryId(1L)
                    .build();

            when(transactionService.save(any(UUID.class), any(CreateTransactionDTO.class)))
                    .thenReturn(sampleTransaction);
            when(transactionService.toResponseDTO(any(Transaction.class)))
                    .thenReturn(sampleResponseDTO);

            mockMvc.perform(post("/api/v1/transactions")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.description").value("Compra supermercado"))
                    .andExpect(jsonPath("$.amount").value(150.50));
        }

        @Test
        @DisplayName("❌ 400 - Descripción vacía")
        void createTransaction_EmptyDescription() throws Exception {
            CreateTransactionDTO dto = CreateTransactionDTO.builder()
                    .description("")
                    .amount(new BigDecimal("150.50"))
                    .type(TransactionType.EXPENSE)
                    .categoryId(1L)
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Monto negativo")
        void createTransaction_NegativeAmount() throws Exception {
            CreateTransactionDTO dto = CreateTransactionDTO.builder()
                    .description("Test")
                    .amount(new BigDecimal("-10.00"))
                    .type(TransactionType.EXPENSE)
                    .categoryId(1L)
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Tipo de transacción null")
        void createTransaction_NullType() throws Exception {
            CreateTransactionDTO dto = CreateTransactionDTO.builder()
                    .description("Test")
                    .amount(new BigDecimal("100.00"))
                    .type(null)
                    .categoryId(1L)
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 404 - Categoría no encontrada")
        void createTransaction_CategoryNotFound() throws Exception {
            CreateTransactionDTO dto = CreateTransactionDTO.builder()
                    .description("Test")
                    .amount(new BigDecimal("100.00"))
                    .type(TransactionType.EXPENSE)
                    .categoryId(999L)
                    .build();

            when(transactionService.save(any(UUID.class), any(CreateTransactionDTO.class)))
                    .thenThrow(new ResourceNotFoundException("Categoría no encontrada con ID: 999"));

            mockMvc.perform(post("/api/v1/transactions")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("❌ 400 - Categoría de tipo incorrecto")
        void createTransaction_CategoryTypeMismatch() throws Exception {
            CreateTransactionDTO dto = CreateTransactionDTO.builder()
                    .description("Salario")
                    .amount(new BigDecimal("5000.00"))
                    .type(TransactionType.INCOME)
                    .categoryId(1L)
                    .build();

            when(transactionService.save(any(UUID.class), any(CreateTransactionDTO.class)))
                    .thenThrow(new BadRequestException("La categoría 'ALIMENTACION' es de tipo EXPENSE"));

            mockMvc.perform(post("/api/v1/transactions")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 403 - Categoría no pertenece al usuario")
        void createTransaction_CategoryNotOwned() throws Exception {
            CreateTransactionDTO dto = CreateTransactionDTO.builder()
                    .description("Test")
                    .amount(new BigDecimal("100.00"))
                    .type(TransactionType.EXPENSE)
                    .categoryId(1L)
                    .build();

            when(transactionService.save(any(UUID.class), any(CreateTransactionDTO.class)))
                    .thenThrow(new AccessDeniedException("La categoría no te pertenece"));

            mockMvc.perform(post("/api/v1/transactions")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("❌ 400 - LinkedToInvestment sin investmentId")
        void createTransaction_LinkedWithoutInvestmentId() throws Exception {
            CreateTransactionDTO dto = CreateTransactionDTO.builder()
                    .description("Inversión en acciones")
                    .amount(new BigDecimal("1000.00"))
                    .type(TransactionType.EXPENSE)
                    .categoryId(1L)
                    .linkedToInvestment(true)
                    .investmentId(null)
                    .build();

            when(transactionService.save(any(UUID.class), any(CreateTransactionDTO.class)))
                    .thenThrow(new BadRequestException("Si la transacción está vinculada a una inversión, debe especificar el ID"));

            mockMvc.perform(post("/api/v1/transactions")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /api/v1/transactions ====================
    @Nested
    @DisplayName("GET /api/v1/transactions - Obtener transacciones")
    class GetTransactions {

        @Test
        @DisplayName("✅ 200 - Obtener todas las transacciones")
        void getAllTransactions_Success() throws Exception {
            List<Transaction> transactions = Arrays.asList(sampleTransaction);
            List<TransactionResponseDTO> responseDTOs = Arrays.asList(sampleResponseDTO);

            when(transactionService.findAll(userId)).thenReturn(transactions);
            when(transactionService.toResponseDTOList(transactions)).thenReturn(responseDTOs);

            mockMvc.perform(get("/api/v1/transactions")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(1));
        }

        @Test
        @DisplayName("✅ 200 - Lista vacía cuando no hay transacciones")
        void getAllTransactions_EmptyList() throws Exception {
            when(transactionService.findAll(userId)).thenReturn(Collections.emptyList());
            when(transactionService.toResponseDTOList(Collections.emptyList())).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/transactions")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    // ==================== GET /api/v1/transactions/{id} ====================
    @Nested
    @DisplayName("GET /api/v1/transactions/{id} - Obtener transacción por ID")
    class GetTransactionById {

        @Test
        @DisplayName("✅ 200 - Obtener transacción existente")
        void getTransactionById_Success() throws Exception {
            when(transactionService.findById(userId, 1L)).thenReturn(sampleTransaction);
            when(transactionService.toResponseDTO(sampleTransaction)).thenReturn(sampleResponseDTO);

            mockMvc.perform(get("/api/v1/transactions/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.description").value("Compra supermercado"));
        }

        @Test
        @DisplayName("❌ 404 - Transacción no encontrada")
        void getTransactionById_NotFound() throws Exception {
            when(transactionService.findById(userId, 999L))
                    .thenThrow(new ResourceNotFoundException("Transacción no encontrada con ID: 999"));

            mockMvc.perform(get("/api/v1/transactions/999")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("❌ 403 - Transacción no pertenece al usuario")
        void getTransactionById_NotOwned() throws Exception {
            when(transactionService.findById(userId, 1L))
                    .thenThrow(new AccessDeniedException("Esta transacción no te pertenece"));

            mockMvc.perform(get("/api/v1/transactions/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== PUT /api/v1/transactions/{id} ====================
    @Nested
    @DisplayName("PUT /api/v1/transactions/{id} - Actualizar transacción")
    class UpdateTransaction {

        @Test
        @DisplayName("✅ 200 - Actualizar transacción exitosamente")
        void updateTransaction_Success() throws Exception {
            UpdateTransactionDTO dto = UpdateTransactionDTO.builder()
                    .description("Compra actualizada")
                    .amount(new BigDecimal("200.00"))
                    .build();

            TransactionResponseDTO updatedResponseDTO = TransactionResponseDTO.builder()
                    .id(1L)
                    .description("Compra actualizada")
                    .amount(new BigDecimal("200.00"))
                    .type(TransactionType.EXPENSE)
                    .build();

            when(transactionService.update(eq(userId), eq(1L), any(UpdateTransactionDTO.class)))
                    .thenReturn(sampleTransaction);
            when(transactionService.toResponseDTO(any())).thenReturn(updatedResponseDTO);

            mockMvc.perform(put("/api/v1/transactions/1")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.description").value("Compra actualizada"));
        }

        @Test
        @DisplayName("❌ 404 - Transacción no encontrada al actualizar")
        void updateTransaction_NotFound() throws Exception {
            UpdateTransactionDTO dto = UpdateTransactionDTO.builder()
                    .description("Test")
                    .build();

            when(transactionService.update(eq(userId), eq(999L), any(UpdateTransactionDTO.class)))
                    .thenThrow(new ResourceNotFoundException("Transacción no encontrada con ID: 999"));

            mockMvc.perform(put("/api/v1/transactions/999")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== DELETE /api/v1/transactions/{id} ====================
    @Nested
    @DisplayName("DELETE /api/v1/transactions/{id} - Eliminar transacción")
    class DeleteTransaction {

        @Test
        @DisplayName("✅ 204 - Eliminar transacción exitosamente")
        void deleteTransaction_Success() throws Exception {
            doNothing().when(transactionService).delete(userId, 1L);

            mockMvc.perform(delete("/api/v1/transactions/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNoContent());

            verify(transactionService, times(1)).delete(userId, 1L);
        }

        @Test
        @DisplayName("❌ 404 - Transacción no encontrada al eliminar")
        void deleteTransaction_NotFound() throws Exception {
            doThrow(new ResourceNotFoundException("Transacción no encontrada con ID: 999"))
                    .when(transactionService).delete(userId, 999L);

            mockMvc.perform(delete("/api/v1/transactions/999")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("❌ 403 - Transacción no pertenece al usuario al eliminar")
        void deleteTransaction_NotOwned() throws Exception {
            doThrow(new AccessDeniedException("Esta transacción no te pertenece"))
                    .when(transactionService).delete(userId, 1L);

            mockMvc.perform(delete("/api/v1/transactions/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== GET /api/v1/transactions/search ====================
    @Nested
    @DisplayName("GET /api/v1/transactions/search - Buscar transacciones")
    class SearchTransactions {

        @Test
        @DisplayName("✅ 200 - Buscar por descripción")
        void searchByDescription_Success() throws Exception {
            List<Transaction> transactions = Arrays.asList(sampleTransaction);
            List<TransactionResponseDTO> responseDTOs = Arrays.asList(sampleResponseDTO);

            when(transactionService.searchByDescription(userId, "supermercado")).thenReturn(transactions);
            when(transactionService.toResponseDTOList(transactions)).thenReturn(responseDTOs);

            mockMvc.perform(get("/api/v1/transactions/search")
                            .header("X-User-Id", userId.toString())
                            .param("keyword", "supermercado"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("❌ 400 - Keyword muy corto")
        void searchByDescription_KeywordTooShort() throws Exception {
            when(transactionService.searchByDescription(userId, "a"))
                    .thenThrow(new BadRequestException("El término de búsqueda debe tener al menos 2 caracteres"));

            mockMvc.perform(get("/api/v1/transactions/search")
                            .header("X-User-Id", userId.toString())
                            .param("keyword", "a"))
                    .andExpect(status().isBadRequest());
        }
    }
}
