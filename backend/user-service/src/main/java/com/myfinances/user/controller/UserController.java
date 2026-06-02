package com.myfinances.user.controller;

import com.myfinances.user.dto.*;
import com.myfinances.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * 📝 Registro de nuevo usuario
     */
    @PostMapping("/register")
    public ResponseEntity<UserProfileResponseDTO> register(@Valid @RequestBody RegisterRequest request) {
        log.debug("POST /users/register - email={}, username={}", request.getEmail(), request.getUsername());
        UserProfileResponseDTO user = userService.register(request);
        log.info("Usuario registrado exitosamente: {}", user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * 🔑 Login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.debug("POST /users/login - email={}", request.getEmail());
        LoginResponse response = userService.login(request);
        log.info("Login exitoso para usuario: {}", response.getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 🔄 Renovar token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@RequestBody Map<String, String> request) {
        log.debug("POST /users/refresh-token");
        String refreshToken = request.get("refreshToken");
        RefreshTokenResponse response = userService.refreshToken(refreshToken);
        log.debug("Token renovado exitosamente");
        return ResponseEntity.ok(response);
    }

    /**
     * 👤 Obtener perfil del usuario autenticado
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> getProfile(@RequestHeader("X-User-Id") UUID userId) {
        log.debug("GET /users/profile - userId={}", userId);
        UserProfileResponseDTO user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * ✏️ Actualizar perfil
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> updateProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateUserProfileDTO updates) {

        log.debug("PUT /users/profile - userId={}", userId);
        UserProfileResponseDTO user = userService.updateProfile(userId, updates);
        log.debug("Perfil actualizado para usuario: {}", userId);
        return ResponseEntity.ok(user);
    }

    /**
     * ❌ Eliminar usuario
     */
    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteUser(@RequestHeader("X-User-Id") UUID userId) {
        log.debug("DELETE /users/profile - userId={}", userId);
        userService.deleteUser(userId);
        log.info("Usuario eliminado: {}", userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Social login registration (idempotent).
     * Called by the frontend after a Google/social OAuth PKCE flow completes.
     * Requires a valid JWT — the gateway propagates X-User-Id from the token sub claim.
     */
    @PostMapping("/social-register")
    public ResponseEntity<UserProfileResponseDTO> socialRegister(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody SocialRegisterRequest request) {

        log.debug("POST /users/social-register - userId={}, email={}", userId, request.getEmail());
        UserProfileResponseDTO user = userService.socialRegister(userId, request);
        log.info("Social register completado para usuario: {}", userId);
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    /**
     * 📱 Iniciar verificación de teléfono (vínculo con WhatsApp).
     * Genera y "envía" un código (Fase 3: por WhatsApp; por ahora se loguea).
     */
    @PostMapping("/phone/verify")
    public ResponseEntity<Map<String, String>> requestPhoneVerification(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody PhoneVerificationRequestDTO request) {

        log.debug("POST /users/phone/verify - userId={}", userId);
        userService.requestPhoneVerification(userId, request.getPhone());
        return ResponseEntity.ok(Map.of(
                "status", "CODE_SENT",
                "message", "Código de verificación enviado al teléfono indicado"));
    }

    /**
     * 📱 Confirmar verificación de teléfono con el código recibido.
     */
    @PostMapping("/phone/confirm")
    public ResponseEntity<UserProfileResponseDTO> confirmPhoneVerification(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody PhoneVerificationConfirmDTO request) {

        log.debug("POST /users/phone/confirm - userId={}", userId);
        return ResponseEntity.ok(userService.confirmPhoneVerification(userId, request.getCode()));
    }

    /**
     * 🔎 Lookup interno teléfono → userId (lo consume el intake-service).
     * No pasa por el gateway; se llama service-to-service dentro del cluster.
     */
    @GetMapping("/by-phone/{phone}")
    public ResponseEntity<PhoneLookupResponseDTO> getUserByPhone(@PathVariable String phone) {
        log.debug("GET /users/by-phone/{}", phone);
        return ResponseEntity.ok(userService.findUserIdByPhone(phone));
    }

    /**
     * Health check (public)
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.debug("GET /users/health");
        return ResponseEntity.ok(Map.of("status", "UP", "service", "user-service"));
    }
}