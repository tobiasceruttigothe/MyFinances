package com.myfinances.gateway_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS configuration for the API Gateway.
 *
 * Exposes a CorsConfigurationSource bean so Spring Security can use it
 * directly via .cors(cors -> cors.configurationSource(...)).
 * OPTIONS preflights are also allowed without auth in SecurityConfig.
 */
@Configuration
public class CorsConfig {

    /**
     * Comma-separated list of allowed origins. Override per environment via
     * the CORS_ALLOWED_ORIGINS env var (e.g. https://myfinances.qzz.io).
     */
    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(allowedOrigins);

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allow all headers — important for Authorization, Content-Type, etc.
        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
