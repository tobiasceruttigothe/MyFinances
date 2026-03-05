package com.myfinances.user.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.time.ZoneId;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private static final String DEFAULT_CURRENCY = "USD";
    private static final String DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";
    private static final String DEFAULT_LANGUAGE = "es";
    private static final Set<String> VALID_ZONE_IDS = Set.copyOf(ZoneId.getAvailableZoneIds());

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final KeycloakService keycloakService;
    private final AccountServiceClient accountServiceClient;
    private final ObjectMapper objectMapper;

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
        UserSettings settings = initializeNewUser(user);
        return toResponseDTO(user, settings);
    }

    /**
     * 🔑 LOGIN
     */
    public LoginResponse login(LoginRequest request) {
        log.debug("Iniciando login para email: {}", request.getEmail());

        Map<String, Object> tokenResponse = keycloakService.login(request);
        log.debug("Autenticación exitosa en Keycloak para: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    log.info("Usuario no encontrado en BD local. Sincronizando desde Keycloak...");
                    return syncUserFromToken((String) tokenResponse.get("access_token"), request.getEmail());
                });

        log.info("Login exitoso para usuario: {}", user.getId());

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

        UserSettings settings = userSettingsRepository.findByUserId(userId).orElse(null);

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
            String currency = updates.getCurrency().toUpperCase();
            if (!isValidCurrencyCode(currency)) {
                throw new IllegalArgumentException("Código de moneda inválido: " + currency);
            }
            settings.setCurrency(currency);
        }
        if (updates.getTimezone() != null) {
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
     * Social login registration (idempotent).
     * Called after the frontend completes a Google/social OAuth flow.
     * If the user already exists in our DB, returns their profile unchanged.
     * If not, creates the DB record + default settings + categories.
     */
    public UserProfileResponseDTO socialRegister(UUID userId, SocialRegisterRequest request) {
        return userRepository.findById(userId)
                .map(user -> {
                    UserSettings settings = userSettingsRepository.findByUserId(userId).orElse(null);
                    log.debug("Social register: usuario ya existe en DB, id={}", userId);
                    return toResponseDTO(user, settings);
                })
                .orElseGet(() -> {
                    String baseUsername = request.getEmail().split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
                    String username = baseUsername;
                    int suffix = 1;
                    while (userRepository.existsByUsername(username)) {
                        username = baseUsername + suffix++;
                    }

                    User user = User.builder()
                            .id(userId)
                            .email(request.getEmail())
                            .username(username)
                            .firstName(request.getFirstName() != null ? request.getFirstName() : "")
                            .lastName(request.getLastName() != null ? request.getLastName() : "")
                            .enabled(true)
                            .build();

                    user = userRepository.save(user);
                    UserSettings settings = initializeNewUser(user);
                    log.info("Social register: nuevo usuario creado id={}, email={}", userId, request.getEmail());
                    return toResponseDTO(user, settings);
                });
    }

    /**
     * ❌ Eliminar usuario
     */
    public void deleteUser(UUID userId) {
        log.debug("Iniciando eliminación de usuario: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        log.debug("Eliminando usuario {} de Keycloak", userId);
        keycloakService.deleteUser(userId);

        userRepository.delete(user);

        log.info("Usuario eliminado exitosamente: {}", userId);
    }

    /**
     * Crea settings por defecto, guarda en BD e inicializa categorías para un nuevo usuario.
     * Usado tanto en registro normal como en sincronización desde Keycloak.
     */
    private UserSettings initializeNewUser(User user) {
        UserSettings settings = UserSettings.builder()
                .user(user)
                .linkInvestmentsToTransactions(false)
                .currency(DEFAULT_CURRENCY)
                .timezone(DEFAULT_TIMEZONE)
                .language(DEFAULT_LANGUAGE)
                .enableAutoGoalAssignments(true)
                .build();
        userSettingsRepository.save(settings);
        log.info("Settings creados para usuario: {}", user.getId());
        try {
            accountServiceClient.initializeUserCategories(user.getId());
        } catch (Exception e) {
            log.warn("No se pudieron inicializar categorías para usuario {}: {}", user.getId(), e.getMessage());
        }
        return settings;
    }

    /**
     * 🔄 Sincroniza un usuario de Keycloak a la BD local.
     * Se usa cuando un usuario existe en Keycloak (ej: importado via realm-export.json)
     * pero aún no tiene registro en nuestra tabla users.
     */
    private User syncUserFromToken(String accessToken, String email) {
        try {
            String[] parts = accessToken.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));

            JsonNode claims = objectMapper.readTree(payload);
            String sub = claims.path("sub").asText(null);
            String preferredUsername = claims.path("preferred_username").asText(null);
            String givenName = claims.path("given_name").asText(null);
            String familyName = claims.path("family_name").asText(null);

            if (sub == null) {
                throw new RuntimeException("No se pudo extraer el 'sub' (userId) del token JWT");
            }

            UUID keycloakId = UUID.fromString(sub);

            User user = User.builder()
                    .id(keycloakId)
                    .email(email)
                    .username(preferredUsername != null ? preferredUsername : email)
                    .firstName(givenName != null ? givenName : "")
                    .lastName(familyName != null ? familyName : "")
                    .enabled(true)
                    .build();

            user = userRepository.save(user);
            log.info("Usuario sincronizado desde Keycloak: id={}, email={}", keycloakId, email);

            initializeNewUser(user);
            return user;
        } catch (Exception e) {
            log.error("Error sincronizando usuario desde Keycloak token", e);
            throw new RuntimeException("Error al sincronizar usuario desde Keycloak: " + e.getMessage());
        }
    }

    private boolean isValidCurrencyCode(String code) {
        try {
            java.util.Currency.getInstance(code);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isValidTimezone(String timezone) {
        return VALID_ZONE_IDS.contains(timezone);
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
