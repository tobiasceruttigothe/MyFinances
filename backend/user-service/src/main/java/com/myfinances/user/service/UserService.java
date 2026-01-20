package com.myfinances.user.service;

import com.myfinances.user.client.AccountServiceClient;
import com.myfinances.user.dto.*;
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

    /**
     * 📝 REGISTRO DE USUARIO
     */
    public UserDTO register(RegisterRequest request) {
        // 1. Validar que no exista
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Ya existe un usuario con ese email");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Ya existe un usuario con ese username");
        }

        try {
            // 2. Crear usuario en Keycloak
            UUID keycloakUserId = keycloakService.createUser(request);

            // 3. Crear usuario en nuestra BD con el UUID de Keycloak
            User user = User.builder()
                    .id(keycloakUserId) // ⭐ Usamos el UUID de Keycloak
                    .email(request.getEmail())
                    .username(request.getUsername())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .enabled(true)
                    .build();

            user = userRepository.save(user);
            log.info("Usuario guardado en BD: {}", user.getId());

            // 4. Crear configuraciones por defecto
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

            // 5. ⭐ Inicializar categorías predefinidas (llamada a account-service)
            try {
                accountServiceClient.initializeUserCategories(user.getId());
                log.info("Categorías predefinidas creadas para usuario: {}", user.getId());
            } catch (Exception e) {
                log.error("Error creando categorías para usuario {}: {}", user.getId(), e.getMessage());
                // No fallamos el registro si falla esto
            }

            return toDTO(user, settings);

        } catch (Exception e) {
            log.error("Error en registro de usuario", e);
            throw e;
        }
    }

    /**
     * 🔑 LOGIN
     */
    public LoginResponse login(LoginRequest request) {
        // 1. Autenticar con Keycloak
        Map<String, Object> tokenResponse = keycloakService.login(request);

        // 2. Buscar usuario en nuestra BD por email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado en BD local"));

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
        return keycloakService.refreshToken(refreshToken);
    }

    /**
     * 👤 Obtener perfil de usuario
     */
    @Transactional(readOnly = true)
    public UserDTO getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElse(null);

        return toDTO(user, settings);
    }

    /**
     * ✏️ Actualizar perfil
     */
    public UserDTO updateProfile(UUID userId, UserDTO updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

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
            settings.setCurrency(updates.getCurrency());
        }
        if (updates.getTimezone() != null) {
            settings.setTimezone(updates.getTimezone());
        }
        if (updates.getLanguage() != null) {
            settings.setLanguage(updates.getLanguage());
        }
        if (updates.getEnableAutoGoalAssignments() != null) {
            settings.setEnableAutoGoalAssignments(updates.getEnableAutoGoalAssignments());
        }

        settings = userSettingsRepository.save(settings);

        return toDTO(savedUser, settings);
    }

    /**
     * ❌ Eliminar usuario
     */
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Eliminar de Keycloak
        keycloakService.deleteUser(userId);

        // Eliminar de BD (cascade borrará settings)
        userRepository.delete(user);

        log.info("Usuario eliminado completamente: {}", userId);
    }

    /**
     * 🔧 Convertir a DTO
     */
    private UserDTO toDTO(User user, UserSettings settings) {
        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .enabled(user.getEnabled());

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