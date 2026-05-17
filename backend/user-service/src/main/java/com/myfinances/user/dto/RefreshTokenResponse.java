package com.myfinances.user.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// ======================== REFRESH TOKEN RESPONSE ========================
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenResponse {

    /**
     * ⭐ JWT renovado de Keycloak
     */
    private String accessToken;

    /**
     * Refresh Token renovado (Keycloak puede rotarlo)
     */
    private String refreshToken;

    /**
     * Tiempo de expiración del nuevo access token, en segundos
     */
    private Integer expiresIn;

    private String tokenType = "Bearer";
}
