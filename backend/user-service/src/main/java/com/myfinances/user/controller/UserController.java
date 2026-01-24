package com.myfinances.user.controller;

import com.myfinances.user.dto.*;
import com.myfinances.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 📝 Registro de nuevo usuario
     */
    @PostMapping("/register")
    public ResponseEntity<UserProfileResponseDTO> register(@Valid @RequestBody RegisterRequest request) {
        UserProfileResponseDTO user = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * 🔑 Login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 🔄 Renovar token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        Map<String, Object> response = userService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    /**
     * 👤 Obtener perfil del usuario autenticado
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> getProfile(@RequestHeader("X-User-Id") UUID userId) {
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

        UserProfileResponseDTO user = userService.updateProfile(userId, updates);
        return ResponseEntity.ok(user);
    }

    /**
     * ❌ Eliminar usuario
     */
    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteUser(@RequestHeader("X-User-Id") UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 🏥 Health check (público)
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "user-service"));
    }
}