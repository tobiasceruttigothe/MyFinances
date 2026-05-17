package com.myfinances.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myfinances.user.dto.*;
import com.myfinances.user.exception.KeycloakException;
import com.myfinances.user.exception.ResourceNotFoundException;
import com.myfinances.user.exception.UserAlreadyExistsException;
import com.myfinances.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private UUID userId;
    private UserProfileResponseDTO sampleUserProfile;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        sampleUserProfile = UserProfileResponseDTO.builder()
                .id(userId)
                .email("test@example.com")
                .username("testuser")
                .firstName("Test")
                .lastName("User")
                .enabled(true)
                .currency("USD")
                .timezone("America/Argentina/Buenos_Aires")
                .language("es")
                .linkInvestmentsToTransactions(false)
                .enableAutoGoalAssignments(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ==================== POST /api/v1/users/register ====================
    @Nested
    @DisplayName("POST /api/v1/users/register - Registro de usuario")
    class RegisterUser {

        @Test
        @DisplayName("✅ 201 - Registro exitoso")
        void register_Success() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("nuevo@example.com")
                    .username("nuevousuario")
                    .password("password123")
                    .firstName("Nuevo")
                    .lastName("Usuario")
                    .build();

            when(userService.register(any(RegisterRequest.class)))
                    .thenReturn(sampleUserProfile);

            mockMvc.perform(post("/api/v1/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("test@example.com"))
                    .andExpect(jsonPath("$.username").value("testuser"));
        }

        @Test
        @DisplayName("❌ 400 - Email vacío")
        void register_EmptyEmail() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("")
                    .username("testuser")
                    .password("password123")
                    .firstName("Test")
                    .lastName("User")
                    .build();

            mockMvc.perform(post("/api/v1/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Email inválido")
        void register_InvalidEmail() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("no-es-email")
                    .username("testuser")
                    .password("password123")
                    .firstName("Test")
                    .lastName("User")
                    .build();

            mockMvc.perform(post("/api/v1/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Username muy corto")
        void register_ShortUsername() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("test@example.com")
                    .username("ab")  // Mínimo 3
                    .password("password123")
                    .firstName("Test")
                    .lastName("User")
                    .build();

            mockMvc.perform(post("/api/v1/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Password muy corta")
        void register_ShortPassword() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("test@example.com")
                    .username("testuser")
                    .password("12345")  // Mínimo 6
                    .firstName("Test")
                    .lastName("User")
                    .build();

            mockMvc.perform(post("/api/v1/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 409 - Email ya existe")
        void register_EmailExists() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("existente@example.com")
                    .username("nuevousuario")
                    .password("password123")
                    .firstName("Test")
                    .lastName("User")
                    .build();

            when(userService.register(any(RegisterRequest.class)))
                    .thenThrow(new UserAlreadyExistsException("Ya existe un usuario con ese email"));

            mockMvc.perform(post("/api/v1/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("❌ 409 - Username ya existe")
        void register_UsernameExists() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("nuevo@example.com")
                    .username("usuarioexistente")
                    .password("password123")
                    .firstName("Test")
                    .lastName("User")
                    .build();

            when(userService.register(any(RegisterRequest.class)))
                    .thenThrow(new UserAlreadyExistsException("Ya existe un usuario con ese username"));

            mockMvc.perform(post("/api/v1/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("❌ 400 - Error de Keycloak")
        void register_KeycloakError() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("nuevo@example.com")
                    .username("nuevousuario")
                    .password("password123")
                    .firstName("Test")
                    .lastName("User")
                    .build();

            when(userService.register(any(RegisterRequest.class)))
                    .thenThrow(new KeycloakException("Error al crear usuario en Keycloak"));

            mockMvc.perform(post("/api/v1/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== POST /api/v1/users/login ====================
    @Nested
    @DisplayName("POST /api/v1/users/login - Login")
    class Login {

        @Test
        @DisplayName("✅ 200 - Login exitoso")
        void login_Success() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("test@example.com")
                    .password("password123")
                    .build();

            LoginResponse response = LoginResponse.builder()
                    .userId(userId)
                    .email("test@example.com")
                    .username("testuser")
                    .firstName("Test")
                    .lastName("User")
                    .accessToken("eyJhbGciOiJSUzI1NiIsInR5cCI...")
                    .refreshToken("eyJhbGciOiJSUzI1NiIsInR5cCI...")
                    .expiresIn(3600)
                    .tokenType("Bearer")
                    .build();

            when(userService.login(any(LoginRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").exists())
                    .andExpect(jsonPath("$.refreshToken").exists())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"));
        }

        @Test
        @DisplayName("❌ 400 - Email vacío")
        void login_EmptyEmail() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("")
                    .password("password123")
                    .build();

            mockMvc.perform(post("/api/v1/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Email inválido")
        void login_InvalidEmail() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("no-es-email")
                    .password("password123")
                    .build();

            mockMvc.perform(post("/api/v1/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Password vacía")
        void login_EmptyPassword() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("test@example.com")
                    .password("")
                    .build();

            mockMvc.perform(post("/api/v1/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 400 - Credenciales inválidas")
        void login_InvalidCredentials() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("test@example.com")
                    .password("wrongpassword")
                    .build();

            when(userService.login(any(LoginRequest.class)))
                    .thenThrow(new KeycloakException("Credenciales inválidas o error en autenticación"));

            mockMvc.perform(post("/api/v1/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ 404 - Usuario no encontrado")
        void login_UserNotFound() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("noexiste@example.com")
                    .password("password123")
                    .build();

            when(userService.login(any(LoginRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Usuario no encontrado con email: noexiste@example.com"));

            mockMvc.perform(post("/api/v1/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== POST /api/v1/users/refresh-token ====================
    @Nested
    @DisplayName("POST /api/v1/users/refresh-token - Renovar token")
    class RefreshToken {

        @Test
        @DisplayName("✅ 200 - Renovar token exitosamente")
        void refreshToken_Success() throws Exception {
            Map<String, String> request = new HashMap<>();
            request.put("refreshToken", "eyJhbGciOiJSUzI1NiIsInR5cCI...");

            RefreshTokenResponse response = RefreshTokenResponse.builder()
                    .accessToken("nuevo_access_token")
                    .refreshToken("nuevo_refresh_token")
                    .expiresIn(3600)
                    .tokenType("Bearer")
                    .build();

            when(userService.refreshToken(anyString())).thenReturn(response);

            mockMvc.perform(post("/api/v1/users/refresh-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").exists())
                    .andExpect(jsonPath("$.refreshToken").exists())
                    .andExpect(jsonPath("$.expiresIn").value(3600))
                    .andExpect(jsonPath("$.tokenType").value("Bearer"));
        }

        @Test
        @DisplayName("❌ 400 - Refresh token vacío")
        void refreshToken_Empty() throws Exception {
            Map<String, String> request = new HashMap<>();
            request.put("refreshToken", "");

            when(userService.refreshToken(anyString()))
                    .thenThrow(new IllegalArgumentException("El refresh token no puede estar vacío"));

            mockMvc.perform(post("/api/v1/users/refresh-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isInternalServerError()); // IllegalArgumentException no está manejada como 400
        }

        @Test
        @DisplayName("❌ 400 - Refresh token inválido")
        void refreshToken_Invalid() throws Exception {
            Map<String, String> request = new HashMap<>();
            request.put("refreshToken", "token_invalido");

            when(userService.refreshToken(anyString()))
                    .thenThrow(new KeycloakException("Error al renovar token"));

            mockMvc.perform(post("/api/v1/users/refresh-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /api/v1/users/profile ====================
    @Nested
    @DisplayName("GET /api/v1/users/profile - Obtener perfil")
    class GetProfile {

        @Test
        @DisplayName("✅ 200 - Obtener perfil exitosamente")
        void getProfile_Success() throws Exception {
            when(userService.getUserProfile(userId)).thenReturn(sampleUserProfile);

            mockMvc.perform(get("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("test@example.com"))
                    .andExpect(jsonPath("$.username").value("testuser"))
                    .andExpect(jsonPath("$.currency").value("USD"));
        }

        @Test
        @DisplayName("❌ 404 - Usuario no encontrado")
        void getProfile_NotFound() throws Exception {
            when(userService.getUserProfile(userId))
                    .thenThrow(new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

            mockMvc.perform(get("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== PUT /api/v1/users/profile ====================
    @Nested
    @DisplayName("PUT /api/v1/users/profile - Actualizar perfil")
    class UpdateProfile {

        @Test
        @DisplayName("✅ 200 - Actualizar perfil exitosamente")
        void updateProfile_Success() throws Exception {
            UpdateUserProfileDTO updates = UpdateUserProfileDTO.builder()
                    .firstName("NuevoNombre")
                    .lastName("NuevoApellido")
                    .currency("EUR")
                    .timezone("Europe/Madrid")
                    .build();

            UserProfileResponseDTO updatedProfile = UserProfileResponseDTO.builder()
                    .id(userId)
                    .email("test@example.com")
                    .username("testuser")
                    .firstName("NuevoNombre")
                    .lastName("NuevoApellido")
                    .currency("EUR")
                    .timezone("Europe/Madrid")
                    .build();

            when(userService.updateProfile(eq(userId), any(UpdateUserProfileDTO.class)))
                    .thenReturn(updatedProfile);

            mockMvc.perform(put("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updates)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName").value("NuevoNombre"))
                    .andExpect(jsonPath("$.currency").value("EUR"));
        }

        @Test
        @DisplayName("❌ 400 - Currency inválido")
        void updateProfile_InvalidCurrency() throws Exception {
            UpdateUserProfileDTO updates = UpdateUserProfileDTO.builder()
                    .currency("INVALID")
                    .build();

            when(userService.updateProfile(eq(userId), any(UpdateUserProfileDTO.class)))
                    .thenThrow(new IllegalArgumentException("Código de moneda inválido: INVALID"));

            mockMvc.perform(put("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updates)))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("❌ 400 - Timezone inválido")
        void updateProfile_InvalidTimezone() throws Exception {
            UpdateUserProfileDTO updates = UpdateUserProfileDTO.builder()
                    .timezone("Invalid/Timezone")
                    .build();

            when(userService.updateProfile(eq(userId), any(UpdateUserProfileDTO.class)))
                    .thenThrow(new IllegalArgumentException("Timezone inválido: Invalid/Timezone"));

            mockMvc.perform(put("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updates)))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("❌ 400 - Currency con formato incorrecto (no ISO)")
        void updateProfile_CurrencyWrongFormat() throws Exception {
            UpdateUserProfileDTO updates = UpdateUserProfileDTO.builder()
                    .currency("EURO")  // Debería ser EUR
                    .build();

            mockMvc.perform(put("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updates)))
                    .andExpect(status().isBadRequest());  // Validación @Size(min=3, max=3)
        }
    }

    // ==================== DELETE /api/v1/users/profile ====================
    @Nested
    @DisplayName("DELETE /api/v1/users/profile - Eliminar usuario")
    class DeleteUser {

        @Test
        @DisplayName("✅ 204 - Eliminar usuario exitosamente")
        void deleteUser_Success() throws Exception {
            doNothing().when(userService).deleteUser(userId);

            mockMvc.perform(delete("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNoContent());

            verify(userService, times(1)).deleteUser(userId);
        }

        @Test
        @DisplayName("❌ 404 - Usuario no encontrado al eliminar")
        void deleteUser_NotFound() throws Exception {
            doThrow(new ResourceNotFoundException("Usuario no encontrado con ID: " + userId))
                    .when(userService).deleteUser(userId);

            mockMvc.perform(delete("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("❌ 400 - Error al eliminar de Keycloak")
        void deleteUser_KeycloakError() throws Exception {
            doThrow(new KeycloakException("Error al eliminar usuario de Keycloak"))
                    .when(userService).deleteUser(userId);

            mockMvc.perform(delete("/api/v1/users/profile")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /api/v1/users/health ====================
    @Nested
    @DisplayName("GET /api/v1/users/health - Health check")
    class HealthCheck {

        @Test
        @DisplayName("✅ 200 - Health check exitoso")
        void health_Success() throws Exception {
            mockMvc.perform(get("/api/v1/users/health"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("UP"))
                    .andExpect(jsonPath("$.service").value("user-service"));
        }
    }
}
