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

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
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
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration PHONE_CODE_TTL = Duration.ofMinutes(10);

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final KeycloakService keycloakService;
    private final AccountServiceClient accountServiceClient;
    private final ObjectMapper objectMapper;
    private final WhatsAppNotifier whatsAppNotifier;

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
     *
     * Keycloak responde con snake_case (access_token, refresh_token, expires_in) per OAuth2 standard.
     * Wrappeamos en RefreshTokenResponse (camelCase) para mantener el contrato consistente con login().
     * Si devolvemos el Map crudo, el frontend lee `data.accessToken` → undefined y rompe la sesión.
     */
    public RefreshTokenResponse refreshToken(String refreshToken) {
        log.debug("Renovando token de acceso");

        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new IllegalArgumentException("El refresh token no puede estar vacío");
        }

        Map<String, Object> kc = keycloakService.refreshToken(refreshToken);
        log.debug("Token renovado exitosamente");

        return RefreshTokenResponse.builder()
                .accessToken((String) kc.get("access_token"))
                .refreshToken((String) kc.get("refresh_token"))
                .expiresIn((Integer) kc.get("expires_in"))
                .tokenType("Bearer")
                .build();
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
     * 📱 Inicia la verificación de un teléfono para vincularlo con WhatsApp.
     * Genera un código de 6 dígitos con TTL y lo guarda contra el usuario.
     *
     * Fase 3: el código se enviará por WhatsApp vía n8n. Por ahora se loguea
     * a nivel INFO para poder probar el flujo end-to-end sin el canal de WhatsApp.
     */
    public void requestPhoneVerification(UUID userId, String phone) {
        log.debug("Solicitando verificación de teléfono para usuario: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        // Si otro usuario ya verificó este número, no se puede reclamar.
        userRepository.findByPhone(phone).ifPresent(existing -> {
            if (!existing.getId().equals(userId) && Boolean.TRUE.equals(existing.getPhoneVerified())) {
                throw new IllegalArgumentException("Ese teléfono ya está vinculado a otra cuenta");
            }
        });

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        user.setPhone(phone);
        user.setPhoneVerified(false);
        user.setPhoneVerificationCode(code);
        user.setPhoneVerificationExpiresAt(LocalDateTime.now().plus(PHONE_CODE_TTL));
        userRepository.save(user);

        log.info("📱 Código de verificación para usuario {} (teléfono {}): {} — válido {} min",
                userId, phone, code, PHONE_CODE_TTL.toMinutes());

        // Fase 3: enviar el código por WhatsApp vía n8n (no-op si no está configurado).
        whatsAppNotifier.send(phone, String.format(
                "Tu código de verificación de MyFinances es: %s (vence en %d minutos).",
                code, PHONE_CODE_TTL.toMinutes()));
    }

    /**
     * 📱 Confirma la verificación del teléfono con el código recibido.
     */
    public UserProfileResponseDTO confirmPhoneVerification(UUID userId, String code) {
        log.debug("Confirmando verificación de teléfono para usuario: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        if (user.getPhoneVerificationCode() == null || user.getPhoneVerificationExpiresAt() == null) {
            throw new IllegalArgumentException("No hay ninguna verificación de teléfono pendiente");
        }
        if (LocalDateTime.now().isAfter(user.getPhoneVerificationExpiresAt())) {
            throw new IllegalArgumentException("El código expiró. Solicitá uno nuevo");
        }
        if (!user.getPhoneVerificationCode().equals(code.trim())) {
            throw new IllegalArgumentException("Código incorrecto");
        }

        user.setPhoneVerified(true);
        user.setPhoneVerificationCode(null);
        user.setPhoneVerificationExpiresAt(null);
        userRepository.save(user);

        log.info("📱 Teléfono verificado para usuario {}: {}", userId, user.getPhone());
        UserSettings settings = userSettingsRepository.findByUserId(userId).orElse(null);
        return toResponseDTO(user, settings);
    }

    /**
     * 🔎 Resuelve un teléfono verificado a su userId.
     * Endpoint interno consumido por el intake-service (no pasa por el gateway).
     */
    @Transactional(readOnly = true)
    public PhoneLookupResponseDTO findUserIdByPhone(String phone) {
        User user = userRepository.findByPhoneAndPhoneVerifiedTrue(phone)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No hay ningún usuario con el teléfono verificado: " + phone));
        return PhoneLookupResponseDTO.builder()
                .userId(user.getId())
                .phone(user.getPhone())
                .build();
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
                .phone(user.getPhone())
                .phoneVerified(user.getPhoneVerified())
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
