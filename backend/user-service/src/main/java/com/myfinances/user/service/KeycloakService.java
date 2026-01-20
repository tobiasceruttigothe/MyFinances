package com.myfinances.user.service;

import com.myfinances.user.dto.LoginRequest;
import com.myfinances.user.dto.RegisterRequest;
import com.myfinances.user.exception.KeycloakException;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Servicio de integración con Keycloak
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {

    @Value("${keycloak.auth-server-url}")
    private String keycloakUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

    @Value("${keycloak.credentials.secret:}")
    private String clientSecret;

    @Value("${keycloak.admin.username}")
    private String adminUsername;

    @Value("${keycloak.admin.password}")
    private String adminPassword;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 🔐 Crea un usuario en Keycloak
     * @return UUID del usuario creado
     */
    public UUID createUser(RegisterRequest request) {
        try {
            Keycloak keycloak = getAdminKeycloak();
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Crear representación del usuario
            UserRepresentation user = new UserRepresentation();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEnabled(true);
            user.setEmailVerified(false); // Cambiar a true si no usas verificación

            // Crear credenciales
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(request.getPassword());
            credential.setTemporary(false);
            user.setCredentials(Collections.singletonList(credential));

            // ⭐ Asignar rol USER por defecto
            user.setRealmRoles(Collections.singletonList("USER"));

            // Crear usuario
            Response response = usersResource.create(user);

            if (response.getStatus() == 201) {
                String locationHeader = response.getHeaderString("Location");
                String userId = locationHeader.substring(locationHeader.lastIndexOf('/') + 1);

                log.info("Usuario creado en Keycloak con ID: {}", userId);
                keycloak.close();

                return UUID.fromString(userId);
            } else {
                String errorMessage = response.readEntity(String.class);
                keycloak.close();
                throw new KeycloakException("Error al crear usuario en Keycloak: " + errorMessage);
            }

        } catch (Exception e) {
            log.error("Error creando usuario en Keycloak", e);
            throw new KeycloakException("Error al crear usuario: " + e.getMessage());
        }
    }

    /**
     * 🔑 Login - Obtiene JWT de Keycloak
     */
    public Map<String, Object> login(LoginRequest request) {
        try {
            String tokenUrl = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "password");
            body.add("client_id", clientId);
            body.add("username", request.getEmail());
            body.add("password", request.getPassword());

            // Solo agregar client_secret si está configurado
            if (clientSecret != null && !clientSecret.isEmpty()) {
                body.add("client_secret", clientSecret);
            }

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    tokenUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                throw new KeycloakException("Error en login: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error en login con Keycloak", e);
            throw new KeycloakException("Credenciales inválidas o error en autenticación");
        }
    }

    /**
     * 🔄 Renovar token con refresh token
     */
    public Map<String, Object> refreshToken(String refreshToken) {
        try {
            String tokenUrl = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "refresh_token");
            body.add("client_id", clientId);
            body.add("refresh_token", refreshToken);

            if (clientSecret != null && !clientSecret.isEmpty()) {
                body.add("client_secret", clientSecret);
            }

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    tokenUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            return response.getBody();

        } catch (Exception e) {
            log.error("Error renovando token", e);
            throw new KeycloakException("Error al renovar token");
        }
    }

    /**
     * ❌ Eliminar usuario de Keycloak
     */
    public void deleteUser(UUID userId) {
        try {
            Keycloak keycloak = getAdminKeycloak();
            RealmResource realmResource = keycloak.realm(realm);

            realmResource.users().delete(userId.toString());

            log.info("Usuario eliminado de Keycloak: {}", userId);
            keycloak.close();

        } catch (Exception e) {
            log.error("Error eliminando usuario de Keycloak", e);
            throw new KeycloakException("Error al eliminar usuario: " + e.getMessage());
        }
    }

    /**
     * 🔧 Obtener cliente admin de Keycloak
     */
    private Keycloak getAdminKeycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(keycloakUrl)
                .realm("master") // Usar realm master para admin
                .username(adminUsername)
                .password(adminPassword)
                .clientId("admin-cli")
                .build();
    }
}