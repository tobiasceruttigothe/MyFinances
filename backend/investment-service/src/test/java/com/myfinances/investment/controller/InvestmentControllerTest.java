package com.myfinances.investment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myfinances.investment.dto.CreateInvestmentDTO;
import com.myfinances.investment.dto.InvestmentResponseDTO;
import com.myfinances.investment.dto.PortfolioSummaryDTO;
import com.myfinances.investment.dto.UpdateInvestmentDTO;
import com.myfinances.investment.exception.AccessDeniedException;
import com.myfinances.investment.exception.BadRequestException;
import com.myfinances.investment.exception.ResourceNotFoundException;
import com.myfinances.investment.model.Investment;
import com.myfinances.investment.model.InvestmentType;
import com.myfinances.investment.service.InvestmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

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

@WebMvcTest(InvestmentController.class)
class InvestmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InvestmentService investmentService;

    private UUID userId;
    private Investment sampleInvestment;
    private InvestmentResponseDTO sampleResponseDTO;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        sampleInvestment = Investment.builder()
                .id(1L)
                .userId(userId)
                .type("ACCION")
                .description("Apple Inc.")
                .initialCapital(new BigDecimal("10000.00"))
                .currentCapital(new BigDecimal("12500.00"))
                .investmentDate(LocalDateTime.now())
                .notes("Compra de acciones AAPL")
                .linkedTransactionCreated(false)
                .build();

        sampleResponseDTO = InvestmentResponseDTO.builder()
                .id(1L)
                .type("ACCION")
                .description("Apple Inc.")
                .initialCapital(new BigDecimal("10000.00"))
                .currentCapital(new BigDecimal("12500.00"))
                .investmentDate(LocalDateTime.now())
                .notes("Compra de acciones AAPL")
                .profit(new BigDecimal("2500.00"))
                .roi(new BigDecimal("25.00"))
                .linkedTransactionCreated(false)
                .build();
    }

    // ==================== POST /api/v1/investments ====================
    @Nested
    @DisplayName("POST /api/v1/investments - Crear inversión")
    class CreateInvestment {

        @Test
        @DisplayName("✅ 201 - Crear inversión con tipo válido (ACCION)")
        void createInvestment_Success() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("ACCION")
                    .description("Apple Inc.")
                    .initialCapital(new BigDecimal("10000.00"))
                    .currentCapital(new BigDecimal("10000.00"))
                    .build();

            when(investmentService.create(any(UUID.class), any(CreateInvestmentDTO.class)))
                    .thenReturn(sampleInvestment);
            when(investmentService.toResponseDTO(any(Investment.class)))
                    .thenReturn(sampleResponseDTO);

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.type").value("ACCION"))
                    .andExpect(jsonPath("$.description").value("Apple Inc."));
        }

        @Test
        @DisplayName("✅ 201 - Crear inversión con tipo CRYPTO")
        void createInvestment_Crypto() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("CRYPTO")
                    .description("Bitcoin")
                    .initialCapital(new BigDecimal("5000.00"))
                    .currentCapital(new BigDecimal("7500.00"))
                    .build();

            Investment cryptoInvestment = Investment.builder()
                    .id(2L)
                    .userId(userId)
                    .type("CRYPTO")
                    .description("Bitcoin")
                    .initialCapital(new BigDecimal("5000.00"))
                    .currentCapital(new BigDecimal("7500.00"))
                    .build();

            InvestmentResponseDTO cryptoResponseDTO = InvestmentResponseDTO.builder()
                    .id(2L)
                    .type("CRYPTO")
                    .description("Bitcoin")
                    .initialCapital(new BigDecimal("5000.00"))
                    .currentCapital(new BigDecimal("7500.00"))
                    .profit(new BigDecimal("2500.00"))
                    .roi(new BigDecimal("50.00"))
                    .build();

            when(investmentService.create(any(UUID.class), any(CreateInvestmentDTO.class)))
                    .thenReturn(cryptoInvestment);
            when(investmentService.toResponseDTO(any(Investment.class)))
                    .thenReturn(cryptoResponseDTO);

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.type").value("CRYPTO"));
        }

        @Test
        @DisplayName("✅ 201 - Crear inversión con tipo PLAZO_FIJO")
        void createInvestment_PlazoFijo() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("PLAZO_FIJO")
                    .description("Plazo fijo Banco Nación")
                    .initialCapital(new BigDecimal("100000.00"))
                    .currentCapital(new BigDecimal("100000.00"))
                    .build();

            when(investmentService.create(any(UUID.class), any(CreateInvestmentDTO.class)))
                    .thenReturn(sampleInvestment);
            when(investmentService.toResponseDTO(any(Investment.class)))
                    .thenReturn(sampleResponseDTO);

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("✅ 201 - Crear inversión con tipo no estándar (se acepta como OTRO)")
        void createInvestment_CustomType() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("ARTE")  // No está en el enum, pero se acepta
                    .description("Cuadro de Picasso")
                    .initialCapital(new BigDecimal("50000.00"))
                    .currentCapital(new BigDecimal("60000.00"))
                    .build();

            when(investmentService.create(any(UUID.class), any(CreateInvestmentDTO.class)))
                    .thenReturn(sampleInvestment);
            when(investmentService.toResponseDTO(any(Investment.class)))
                    .thenReturn(sampleResponseDTO);

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("❌ 400 - Tipo vacío")
        void createInvestment_EmptyType() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("")
                    .description("Test")
                    .initialCapital(new BigDecimal("1000.00"))
                    .currentCapital(new BigDecimal("1000.00"))
                    .build();

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Descripción vacía")
        void createInvestment_EmptyDescription() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("ACCION")
                    .description("")
                    .initialCapital(new BigDecimal("1000.00"))
                    .currentCapital(new BigDecimal("1000.00"))
                    .build();

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Capital inicial null")
        void createInvestment_NullInitialCapital() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("ACCION")
                    .description("Test")
                    .initialCapital(null)
                    .currentCapital(new BigDecimal("1000.00"))
                    .build();

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Capital inicial negativo")
        void createInvestment_NegativeInitialCapital() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("ACCION")
                    .description("Test")
                    .initialCapital(new BigDecimal("-100.00"))
                    .currentCapital(new BigDecimal("1000.00"))
                    .build();

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Capital actual negativo")
        void createInvestment_NegativeCurrentCapital() throws Exception {
            CreateInvestmentDTO dto = CreateInvestmentDTO.builder()
                    .type("ACCION")
                    .description("Test")
                    .initialCapital(new BigDecimal("1000.00"))
                    .currentCapital(new BigDecimal("-500.00"))
                    .build();

            mockMvc.perform(post("/api/v1/investments")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /api/v1/investments ====================
    @Nested
    @DisplayName("GET /api/v1/investments - Obtener inversiones")
    class GetInvestments {

        @Test
        @DisplayName("✅ 200 - Obtener todas las inversiones")
        void getAllInvestments_Success() throws Exception {
            List<Investment> investments = Arrays.asList(sampleInvestment);
            List<InvestmentResponseDTO> responseDTOs = Arrays.asList(sampleResponseDTO);

            when(investmentService.findAll(userId)).thenReturn(investments);
            when(investmentService.toResponseDTOList(investments)).thenReturn(responseDTOs);

            mockMvc.perform(get("/api/v1/investments")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].type").value("ACCION"));
        }

        @Test
        @DisplayName("✅ 200 - Lista vacía")
        void getAllInvestments_Empty() throws Exception {
            when(investmentService.findAll(userId)).thenReturn(Collections.emptyList());
            when(investmentService.toResponseDTOList(Collections.emptyList())).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/investments")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    // ==================== GET /api/v1/investments/{id} ====================
    @Nested
    @DisplayName("GET /api/v1/investments/{id} - Obtener inversión por ID")
    class GetInvestmentById {

        @Test
        @DisplayName("✅ 200 - Obtener inversión existente")
        void getInvestmentById_Success() throws Exception {
            when(investmentService.findById(userId, 1L)).thenReturn(sampleInvestment);
            when(investmentService.toResponseDTO(sampleInvestment)).thenReturn(sampleResponseDTO);

            mockMvc.perform(get("/api/v1/investments/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.type").value("ACCION"));
        }

        @Test
        @DisplayName("❌ 404 - Inversión no encontrada")
        void getInvestmentById_NotFound() throws Exception {
            when(investmentService.findById(userId, 999L))
                    .thenThrow(new ResourceNotFoundException("Inversión no encontrada con ID: 999"));

            mockMvc.perform(get("/api/v1/investments/999")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("❌ 403 - Inversión no pertenece al usuario")
        void getInvestmentById_NotOwned() throws Exception {
            when(investmentService.findById(userId, 1L))
                    .thenThrow(new AccessDeniedException("Esta inversión no te pertenece"));

            mockMvc.perform(get("/api/v1/investments/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== GET /api/v1/investments/type/{type} ====================
    @Nested
    @DisplayName("GET /api/v1/investments/type/{type} - Obtener inversiones por tipo")
    class GetInvestmentsByType {

        @Test
        @DisplayName("✅ 200 - Obtener inversiones por tipo ACCION")
        void getByType_Success() throws Exception {
            List<Investment> investments = Arrays.asList(sampleInvestment);
            List<InvestmentResponseDTO> responseDTOs = Arrays.asList(sampleResponseDTO);

            when(investmentService.findByType(userId, "ACCION")).thenReturn(investments);
            when(investmentService.toResponseDTOList(investments)).thenReturn(responseDTOs);

            mockMvc.perform(get("/api/v1/investments/type/ACCION")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].type").value("ACCION"));
        }

        @Test
        @DisplayName("❌ 400 - Tipo vacío")
        void getByType_EmptyType() throws Exception {
            when(investmentService.findByType(userId, ""))
                    .thenThrow(new BadRequestException("El tipo de inversión no puede estar vacío"));

            mockMvc.perform(get("/api/v1/investments/type/")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound()); // Spring devuelve 404 para paths vacíos
        }
    }

    // ==================== PUT /api/v1/investments/{id} ====================
    @Nested
    @DisplayName("PUT /api/v1/investments/{id} - Actualizar inversión")
    class UpdateInvestment {

        @Test
        @DisplayName("✅ 200 - Actualizar inversión exitosamente")
        void updateInvestment_Success() throws Exception {
            UpdateInvestmentDTO dto = UpdateInvestmentDTO.builder()
                    .currentCapital(new BigDecimal("15000.00"))
                    .notes("Actualizado después de ganancias")
                    .build();

            Investment updatedInvestment = Investment.builder()
                    .id(1L)
                    .userId(userId)
                    .type("ACCION")
                    .description("Apple Inc.")
                    .initialCapital(new BigDecimal("10000.00"))
                    .currentCapital(new BigDecimal("15000.00"))
                    .notes("Actualizado después de ganancias")
                    .build();

            InvestmentResponseDTO updatedResponseDTO = InvestmentResponseDTO.builder()
                    .id(1L)
                    .type("ACCION")
                    .description("Apple Inc.")
                    .currentCapital(new BigDecimal("15000.00"))
                    .profit(new BigDecimal("5000.00"))
                    .roi(new BigDecimal("50.00"))
                    .build();

            when(investmentService.update(eq(userId), eq(1L), any(UpdateInvestmentDTO.class)))
                    .thenReturn(updatedInvestment);
            when(investmentService.toResponseDTO(updatedInvestment)).thenReturn(updatedResponseDTO);

            mockMvc.perform(put("/api/v1/investments/1")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentCapital").value(15000.00));
        }

        @Test
        @DisplayName("❌ 404 - Inversión no encontrada al actualizar")
        void updateInvestment_NotFound() throws Exception {
            UpdateInvestmentDTO dto = UpdateInvestmentDTO.builder()
                    .currentCapital(new BigDecimal("15000.00"))
                    .build();

            when(investmentService.update(eq(userId), eq(999L), any(UpdateInvestmentDTO.class)))
                    .thenThrow(new ResourceNotFoundException("Inversión no encontrada con ID: 999"));

            mockMvc.perform(put("/api/v1/investments/999")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("❌ 400 - Capital actual negativo al actualizar")
        void updateInvestment_NegativeCapital() throws Exception {
            UpdateInvestmentDTO dto = UpdateInvestmentDTO.builder()
                    .currentCapital(new BigDecimal("-1000.00"))
                    .build();

            mockMvc.perform(put("/api/v1/investments/1")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== DELETE /api/v1/investments/{id} ====================
    @Nested
    @DisplayName("DELETE /api/v1/investments/{id} - Eliminar inversión")
    class DeleteInvestment {

        @Test
        @DisplayName("✅ 204 - Eliminar inversión exitosamente")
        void deleteInvestment_Success() throws Exception {
            doNothing().when(investmentService).delete(userId, 1L);

            mockMvc.perform(delete("/api/v1/investments/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNoContent());

            verify(investmentService, times(1)).delete(userId, 1L);
        }

        @Test
        @DisplayName("❌ 404 - Inversión no encontrada al eliminar")
        void deleteInvestment_NotFound() throws Exception {
            doThrow(new ResourceNotFoundException("Inversión no encontrada con ID: 999"))
                    .when(investmentService).delete(userId, 999L);

            mockMvc.perform(delete("/api/v1/investments/999")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("❌ 403 - Inversión no pertenece al usuario al eliminar")
        void deleteInvestment_NotOwned() throws Exception {
            doThrow(new AccessDeniedException("Esta inversión no te pertenece"))
                    .when(investmentService).delete(userId, 1L);

            mockMvc.perform(delete("/api/v1/investments/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== GET /api/v1/investments/portfolio/summary ====================
    @Nested
    @DisplayName("GET /api/v1/investments/portfolio/summary - Resumen del portfolio")
    class GetPortfolioSummary {

        @Test
        @DisplayName("✅ 200 - Obtener resumen del portfolio")
        void getPortfolioSummary_Success() throws Exception {
            PortfolioSummaryDTO summary = PortfolioSummaryDTO.builder()
                    .totalInvested(new BigDecimal("50000.00"))
                    .totalCurrentValue(new BigDecimal("65000.00"))
                    .totalProfit(new BigDecimal("15000.00"))
                    .overallROI(new BigDecimal("30.00"))
                    .totalInvestments(5L)
                    .calculatedAt(LocalDateTime.now())
                    .build();

            when(investmentService.getPortfolioSummary(userId)).thenReturn(summary);

            mockMvc.perform(get("/api/v1/investments/portfolio/summary")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalInvested").value(50000.00))
                    .andExpect(jsonPath("$.totalCurrentValue").value(65000.00))
                    .andExpect(jsonPath("$.overallROI").value(30.00));
        }

        @Test
        @DisplayName("✅ 200 - Portfolio vacío")
        void getPortfolioSummary_Empty() throws Exception {
            PortfolioSummaryDTO emptySummary = PortfolioSummaryDTO.builder()
                    .totalInvested(BigDecimal.ZERO)
                    .totalCurrentValue(BigDecimal.ZERO)
                    .totalProfit(BigDecimal.ZERO)
                    .overallROI(BigDecimal.ZERO)
                    .totalInvestments(0L)
                    .calculatedAt(LocalDateTime.now())
                    .build();

            when(investmentService.getPortfolioSummary(userId)).thenReturn(emptySummary);

            mockMvc.perform(get("/api/v1/investments/portfolio/summary")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalInvestments").value(0));
        }
    }

    // ==================== Tests del InvestmentType Enum ====================
    @Nested
    @DisplayName("InvestmentType - Validación de tipos de inversión")
    class InvestmentTypeTests {

        @Test
        @DisplayName("✅ Validar tipos estándar")
        void validateStandardTypes() {
            // Todos los tipos válidos del enum
            assert InvestmentType.isValid("ACCION");
            assert InvestmentType.isValid("BONO");
            assert InvestmentType.isValid("PLAZO_FIJO");
            assert InvestmentType.isValid("CRYPTO");
            assert InvestmentType.isValid("FONDO");
            assert InvestmentType.isValid("ETF");
            assert InvestmentType.isValid("INMUEBLE");
            assert InvestmentType.isValid("CEDEAR");
            assert InvestmentType.isValid("DIVISA");
            assert InvestmentType.isValid("COMMODITIES");
            assert InvestmentType.isValid("OTRO");
        }

        @Test
        @DisplayName("✅ Tipos en minúscula se convierten correctamente")
        void validateLowercaseTypes() {
            assert InvestmentType.isValid("accion");
            assert InvestmentType.isValid("Crypto");
            assert InvestmentType.isValid("plazo_fijo");
        }

        @Test
        @DisplayName("❌ Tipos inválidos retornan false")
        void validateInvalidTypes() {
            assert !InvestmentType.isValid("INVALIDO");
            assert !InvestmentType.isValid("ARTE");
            assert !InvestmentType.isValid("");
            assert !InvestmentType.isValid(null);
        }

        @Test
        @DisplayName("✅ fromString convierte correctamente o devuelve OTRO")
        void testFromString() {
            assert InvestmentType.fromString("ACCION") == InvestmentType.ACCION;
            assert InvestmentType.fromString("INVALIDO") == InvestmentType.OTRO;
            assert InvestmentType.fromString(null) == InvestmentType.OTRO;
        }

        @Test
        @DisplayName("✅ DisplayName retorna nombres legibles")
        void testDisplayNames() {
            assert InvestmentType.ACCION.getDisplayName().equals("Acciones");
            assert InvestmentType.CRYPTO.getDisplayName().equals("Criptomonedas");
            assert InvestmentType.PLAZO_FIJO.getDisplayName().equals("Plazo Fijo");
        }
    }
}
