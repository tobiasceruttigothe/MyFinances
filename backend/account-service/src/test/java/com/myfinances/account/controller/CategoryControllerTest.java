package com.myfinances.account.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.myfinances.account.dto.CategoryResponseDTO;
import com.myfinances.account.dto.CreateCategoryDTO;
import com.myfinances.account.dto.UpdateCategoryDTO;
import com.myfinances.account.exception.AccessDeniedException;
import com.myfinances.account.exception.BadRequestException;
import com.myfinances.account.exception.GlobalExceptionHandler;
import com.myfinances.account.exception.ResourceNotFoundException;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.service.CategoryInitializationService;
import com.myfinances.account.service.CategoryService;
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
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private CategoryService categoryService;

    @Mock
    private CategoryInitializationService initService;

    @InjectMocks
    private CategoryController categoryController;

    private UUID userId;
    private CategoryType sampleCategory;
    private CategoryResponseDTO sampleResponseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        userId = UUID.randomUUID();

        sampleCategory = CategoryType.builder()
                .id(1L)
                .userId(userId)
                .name("ALIMENTACION")
                .type(TransactionType.EXPENSE)
                .parentId(null)
                .isSystem(false)
                .description("Gastos de alimentación")
                .build();

        sampleResponseDTO = CategoryResponseDTO.builder()
                .id(1L)
                .name("ALIMENTACION")
                .type(TransactionType.EXPENSE)
                .parentId(null)
                .description("Gastos de alimentación")
                .transactionCount(10L)
                .totalAmount(new BigDecimal("1500.00"))
                .build();
    }

    // ==================== POST /api/v1/categories ====================
    @Nested
    @DisplayName("POST /api/v1/categories - Crear categoría")
    class CreateCategory {

        @Test
        @DisplayName("✅ 201 - Crear categoría exitosamente")
        void createCategory_Success() throws Exception {
            CreateCategoryDTO dto = CreateCategoryDTO.builder()
                    .name("Transporte")
                    .type(TransactionType.EXPENSE)
                    .description("Gastos de transporte")
                    .build();

            when(categoryService.create(any(UUID.class), any(CreateCategoryDTO.class)))
                    .thenReturn(sampleCategory);
            when(categoryService.toResponseDTO(any(CategoryType.class)))
                    .thenReturn(sampleResponseDTO);

            mockMvc.perform(post("/api/v1/categories")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("ALIMENTACION"));
        }

        @Test
        @DisplayName("❌ 400 - Nombre vacío")
        void createCategory_EmptyName() throws Exception {
            CreateCategoryDTO dto = CreateCategoryDTO.builder()
                    .name("")
                    .type(TransactionType.EXPENSE)
                    .build();

            mockMvc.perform(post("/api/v1/categories")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Tipo null")
        void createCategory_NullType() throws Exception {
            CreateCategoryDTO dto = CreateCategoryDTO.builder()
                    .name("Transporte")
                    .type(null)
                    .build();

            mockMvc.perform(post("/api/v1/categories")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Categoría duplicada")
        void createCategory_Duplicate() throws Exception {
            CreateCategoryDTO dto = CreateCategoryDTO.builder()
                    .name("Alimentación")
                    .type(TransactionType.EXPENSE)
                    .build();

            when(categoryService.create(any(UUID.class), any(CreateCategoryDTO.class)))
                    .thenThrow(new BadRequestException("Ya tienes una categoría con el nombre: Alimentación"));

            mockMvc.perform(post("/api/v1/categories")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Categoría padre de tipo diferente")
        void createCategory_ParentTypeMismatch() throws Exception {
            CreateCategoryDTO dto = CreateCategoryDTO.builder()
                    .name("Subcategoría")
                    .type(TransactionType.INCOME)
                    .parentId(1L) // Padre es de tipo EXPENSE
                    .build();

            when(categoryService.create(any(UUID.class), any(CreateCategoryDTO.class)))
                    .thenThrow(new BadRequestException("La categoría padre debe ser del mismo tipo (INCOME/EXPENSE)"));

            mockMvc.perform(post("/api/v1/categories")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 403 - Categoría padre no pertenece al usuario")
        void createCategory_ParentNotOwned() throws Exception {
            CreateCategoryDTO dto = CreateCategoryDTO.builder()
                    .name("Subcategoría")
                    .type(TransactionType.EXPENSE)
                    .parentId(99L)
                    .build();

            when(categoryService.create(any(UUID.class), any(CreateCategoryDTO.class)))
                    .thenThrow(new AccessDeniedException("La categoría padre no te pertenece"));

            mockMvc.perform(post("/api/v1/categories")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("❌ 404 - Categoría padre no encontrada")
        void createCategory_ParentNotFound() throws Exception {
            CreateCategoryDTO dto = CreateCategoryDTO.builder()
                    .name("Subcategoría")
                    .type(TransactionType.EXPENSE)
                    .parentId(999L)
                    .build();

            when(categoryService.create(any(UUID.class), any(CreateCategoryDTO.class)))
                    .thenThrow(new ResourceNotFoundException("Categoría padre no encontrada con ID: 999"));

            mockMvc.perform(post("/api/v1/categories")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== GET /api/v1/categories ====================
    @Nested
    @DisplayName("GET /api/v1/categories - Obtener categorías")
    class GetCategories {

        @Test
        @DisplayName("✅ 200 - Obtener todas las categorías")
        void getAllCategories_Success() throws Exception {
            List<CategoryType> categories = Arrays.asList(sampleCategory);
            List<CategoryResponseDTO> responseDTOs = Arrays.asList(sampleResponseDTO);

            when(categoryService.findAllByUser(userId)).thenReturn(categories);
            when(categoryService.toResponseDTOList(categories)).thenReturn(responseDTOs);

            mockMvc.perform(get("/api/v1/categories")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].name").value("ALIMENTACION"));
        }

        @Test
        @DisplayName("✅ 200 - Lista vacía")
        void getAllCategories_Empty() throws Exception {
            when(categoryService.findAllByUser(userId)).thenReturn(Collections.emptyList());
            when(categoryService.toResponseDTOList(Collections.emptyList())).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/categories")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    // ==================== GET /api/v1/categories/{id} ====================
    @Nested
    @DisplayName("GET /api/v1/categories/{id} - Obtener categoría por ID")
    class GetCategoryById {

        @Test
        @DisplayName("✅ 200 - Obtener categoría existente")
        void getCategoryById_Success() throws Exception {
            when(categoryService.findById(userId, 1L)).thenReturn(sampleCategory);
            when(categoryService.toResponseDTO(sampleCategory)).thenReturn(sampleResponseDTO);

            mockMvc.perform(get("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("ALIMENTACION"));
        }

        @Test
        @DisplayName("❌ 404 - Categoría no encontrada")
        void getCategoryById_NotFound() throws Exception {
            when(categoryService.findById(userId, 999L))
                    .thenThrow(new ResourceNotFoundException("Categoría no encontrada con ID: 999"));

            mockMvc.perform(get("/api/v1/categories/999")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("❌ 403 - Categoría no pertenece al usuario")
        void getCategoryById_NotOwned() throws Exception {
            when(categoryService.findById(userId, 1L))
                    .thenThrow(new AccessDeniedException("Esta categoría no te pertenece"));

            mockMvc.perform(get("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== PUT /api/v1/categories/{id} ====================
    @Nested
    @DisplayName("PUT /api/v1/categories/{id} - Actualizar categoría")
    class UpdateCategory {

        @Test
        @DisplayName("✅ 200 - Actualizar categoría exitosamente")
        void updateCategory_Success() throws Exception {
            UpdateCategoryDTO dto = UpdateCategoryDTO.builder()
                    .name("Comida")
                    .description("Actualizado")
                    .build();

            CategoryResponseDTO updatedResponseDTO = CategoryResponseDTO.builder()
                    .id(1L)
                    .name("COMIDA")
                    .type(TransactionType.EXPENSE)
                    .description("Actualizado")
                    .build();

            when(categoryService.update(eq(userId), eq(1L), any(UpdateCategoryDTO.class)))
                    .thenReturn(sampleCategory);
            when(categoryService.toResponseDTO(sampleCategory)).thenReturn(updatedResponseDTO);

            mockMvc.perform(put("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("COMIDA"));
        }

        @Test
        @DisplayName("❌ 400 - No se puede modificar categoría del sistema")
        void updateCategory_SystemCategory() throws Exception {
            UpdateCategoryDTO dto = UpdateCategoryDTO.builder()
                    .name("Nuevo nombre")
                    .build();

            when(categoryService.update(eq(userId), eq(1L), any(UpdateCategoryDTO.class)))
                    .thenThrow(new BadRequestException("No puedes modificar categorías del sistema"));

            mockMvc.perform(put("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - No puede ser padre de sí misma")
        void updateCategory_SelfParent() throws Exception {
            UpdateCategoryDTO dto = UpdateCategoryDTO.builder()
                    .parentId(1L)
                    .build();

            when(categoryService.update(eq(userId), eq(1L), any(UpdateCategoryDTO.class)))
                    .thenThrow(new BadRequestException("Una categoría no puede ser padre de sí misma"));

            mockMvc.perform(put("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== DELETE /api/v1/categories/{id} ====================
    @Nested
    @DisplayName("DELETE /api/v1/categories/{id} - Eliminar categoría")
    class DeleteCategory {

        @Test
        @DisplayName("✅ 204 - Eliminar categoría exitosamente")
        void deleteCategory_Success() throws Exception {
            doNothing().when(categoryService).delete(userId, 1L);

            mockMvc.perform(delete("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNoContent());

            verify(categoryService, times(1)).delete(userId, 1L);
        }

        @Test
        @DisplayName("❌ 400 - No se puede eliminar categoría del sistema")
        void deleteCategory_SystemCategory() throws Exception {
            doThrow(new BadRequestException("No puedes eliminar categorías del sistema"))
                    .when(categoryService).delete(userId, 1L);

            mockMvc.perform(delete("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Categoría tiene transacciones asociadas")
        void deleteCategory_HasTransactions() throws Exception {
            doThrow(new BadRequestException("No puedes eliminar la categoría porque tiene 5 transacciones asociadas"))
                    .when(categoryService).delete(userId, 1L);

            mockMvc.perform(delete("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Categoría tiene subcategorías")
        void deleteCategory_HasSubcategories() throws Exception {
            doThrow(new BadRequestException("No puedes eliminar la categoría porque tiene 3 subcategorías"))
                    .when(categoryService).delete(userId, 1L);

            mockMvc.perform(delete("/api/v1/categories/1")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== POST /api/v1/categories/initialize-for-user/{userId} ====================
    @Nested
    @DisplayName("POST /api/v1/categories/initialize-for-user/{userId} - Inicializar categorías")
    class InitializeCategories {

        @Test
        @DisplayName("✅ 201 - Inicializar categorías para usuario")
        void initializeCategories_Success() throws Exception {
            UUID newUserId = UUID.randomUUID();
            doNothing().when(initService).initializeUserCategories(newUserId);

            mockMvc.perform(post("/api/v1/categories/initialize-for-user/" + newUserId))
                    .andExpect(status().isCreated());

            verify(initService, times(1)).initializeUserCategories(newUserId);
        }
    }
}
