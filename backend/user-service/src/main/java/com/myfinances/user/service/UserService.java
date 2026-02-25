package com.myfinances.user.service;

import com.myfinances.user.client.AccountServiceClient;
import com.myfinances.user.dto.*;
import com.myfinances.user.exception.ResourceNotFoundException;
import com.myfinances.user.exception.UserAlreadyExistsException;
import com.myfinances.user.model.User;
import com.myfinances.user.model.UserSettings;
import com.myfinances.user.repository.UserRepository;
import com.myfinances.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final KeycloakService keycloakService;
    private final AccountServiceClient accountServiceClient;

    public UserProfileResponseDTO register(RegisterRequest request) {
        log.debug("Iniciando registro de usuario: email={}, username={}", request.getEmail(), request.getUsername());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Intento de registro con email duplicado: {}", request.getEmail());
            throw new UserAlreadyExistsException("Ya existe un usuario con ese email");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Intento de registro con username duplicado: {}", request.getUsername());
            throw new UserAlreadyExistsException("Ya existe un usuario con ese username");
        }
        try {
            log.debug("Creando usuario en Keycloak: {}", request.getEmail());
            UUID keycloakUserId = keycloakService.createUser(request);
            log.debug("Usuario creado en Keycloak con ID: {}", keycloakUserId);

            User user = User.builder()
                    .id(keycloakUserId)
                    .email(request.getEmail())
                    .username(request.getUsername())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .enabled(true)
                    .build();

            user = userRepository.save(user);

            UserSettings settings = UserSettings.builder()
                    .user(user)
                    .linkInvestmentsToTransactions(false)
                    .currency("USD")
                    .timezone("America/Argentina/Buenos_Aires")
                    .language("es")
                    .enableAutoGoalAssignments(true)
                    .build();

            userSettingsRepository.save(settings);
            log.info("Settings creados para usuario: {}", user.getId());

            try {
                accountServiceClient.initializeUserCategories(user.getId());
            } catch (Exception e) {
                log.error("Error creando categorías: {}", e.getMessage());
            }

            return toResponseDTO(user, settings);
        } catch (Exception e) {
            log.error("Error en registro de usuario", e);
            throw e;
        }
    }

    /**
     * 🔑 LOGIN
     */
    public LoginResponse login(LoginRequest request) {
        log.debug("Iniciando login para email: {}", request.getEmail());

        // 1. Autenticar con Keycloak
        Map<String, Object> tokenResponse = keycloakService.login(request);
        log.debug("Autenticación exitosa en Keycloak para: {}", request.getEmail());

        // 2. Buscar usuario en nuestra BD por email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + request.getEmail()));

        log.info("Login exitoso para usuario: {}", user.getId());

        // 3. Construir respuesta
        return LoginResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .accessToken((String) tokenResponse.get("access_token"))
                .refreshToken((String) tokenResponse.get("refresh_token"))
                .expiresIn((Integer) tokenResponse.get("expires_in"))
                .tokenType("Bearer")
                .build();
    }

    /**
     * 🔄 Renovar token
     */
    public Map<String, Object> refreshToken(String refreshToken) {
        log.debug("Renovando token de acceso");

        // ⭐ Validación del refreshToken
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new IllegalArgumentException("El refresh token no puede estar vacío");
        }

        Map<String, Object> response = keycloakService.refreshToken(refreshToken);
        log.debug("Token renovado exitosamente");
        return response;
    }

    /**
     * 👤 Obtener perfil de usuario
     */
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfile(UUID userId) {
        log.debug("Obteniendo perfil para usuario: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElse(null);

        log.debug("Perfil obtenido para usuario: {}", userId);
        return toResponseDTO(user, settings);
    }

    public UserProfileResponseDTO updateProfile(UUID userId, UpdateUserProfileDTO updates) {
        log.debug("Actualizando perfil para usuario: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        if (updates.getFirstName() != null) {
            user.setFirstName(updates.getFirstName());
        }
        if (updates.getLastName() != null) {
            user.setLastName(updates.getLastName());
        }

        final User savedUser = userRepository.save(user);

        // Actualizar settings si vienen
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserSettings newSettings = new UserSettings();
                    newSettings.setUser(savedUser);
                    return newSettings;
                });

        if (updates.getLinkInvestmentsToTransactions() != null) {
            settings.setLinkInvestmentsToTransactions(updates.getLinkInvestmentsToTransactions());
        }
        if (updates.getCurrency() != null) {
            // ⭐ MEJORA: Validar que sea un código de moneda válido (ISO 4217)
            String currency = updates.getCurrency().toUpperCase();
            if (!isValidCurrencyCode(currency)) {
                throw new IllegalArgumentException("Código de moneda inválido: " + currency);
            }
            settings.setCurrency(currency);
        }
        if (updates.getTimezone() != null) {
            // ⭐ MEJORA: Validar que sea un timezone válido
            if (!isValidTimezone(updates.getTimezone())) {
                throw new IllegalArgumentException("Timezone inválido: " + updates.getTimezone());
            }
            settings.setTimezone(updates.getTimezone());
        }
        if (updates.getLanguage() != null) {
            settings.setLanguage(updates.getLanguage());
        }
        if (updates.getEnableAutoGoalAssignments() != null) {
            settings.setEnableAutoGoalAssignments(updates.getEnableAutoGoalAssignments());
        }

        settings = userSettingsRepository.save(settings);

        log.info("Perfil actualizado exitosamente para usuario: {}", userId);
        return toResponseDTO(savedUser, settings);
    }

    /**
     * ⭐ Valida si un código de moneda es válido (ISO 4217)
     */
    private boolean isValidCurrencyCode(String code) {
        try {
            java.util.Currency.getInstance(code);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * ⭐ Valida si un timezone es válido
     */
    private boolean isValidTimezone(String timezone) {
        return java.time.ZoneId.getAvailableZoneIds().contains(timezone);
    }

    /**
     * ❌ Eliminar usuario
     */
    public void deleteUser(UUID userId) {
        log.debug("Iniciando eliminación de usuario: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        // Eliminar de Keycloak
        log.debug("Eliminando usuario {} de Keycloak", userId);
        keycloakService.deleteUser(userId);

        // Eliminar de BD (cascade borrará settings)
        userRepository.delete(user);

        log.info("Usuario eliminado exitosamente: {}", userId);
    }

    private UserProfileResponseDTO toResponseDTO(User user, UserSettings settings) {
        UserProfileResponseDTO.UserProfileResponseDTOBuilder builder = UserProfileResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());

        if (settings != null) {
            builder
                    .linkInvestmentsToTransactions(settings.getLinkInvestmentsToTransactions())
                    .currency(settings.getCurrency())
                    .timezone(settings.getTimezone())
                    .language(settings.getLanguage())
                    .enableAutoGoalAssignments(settings.getEnableAutoGoalAssignments());
        }

        return builder.build();
    }
}