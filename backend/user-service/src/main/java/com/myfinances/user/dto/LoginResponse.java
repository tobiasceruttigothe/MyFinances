package com.myfinances.user.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

// ======================== LOGIN RESPONSE ========================
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private UUID userId;
    private String email;
    private String username;
    private String firstName;
    private String lastName;

    /**
     * ⭐ JWT de Keycloak (Access Token)
     */
    private String accessToken;

    /**
     * Refresh Token para renovar el JWT
     */
    private String refreshToken;

    /**
     * Tiempo de expiración en segundos
     */
    private Integer expiresIn;

    private String tokenType = "Bearer";
}
