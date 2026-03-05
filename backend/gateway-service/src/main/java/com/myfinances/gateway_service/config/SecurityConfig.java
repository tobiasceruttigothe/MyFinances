package com.myfinances.gateway_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.reactive.CorsConfigurationSource;

/**
 * Configuración de seguridad para el Gateway.
 *
 * CORS es delegado al CorsConfigurationSource definido en CorsConfig.
 * Las requests OPTIONS (preflight) se permiten sin autenticación para que
 * el browser pueda completar la negociación CORS antes de enviar el JWT.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            CorsConfigurationSource corsConfigurationSource) {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        // Preflight CORS — MUST be before any auth check
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Endpoints públicos
                        .pathMatchers("/api/v1/users/register").permitAll()
                        .pathMatchers("/api/v1/users/login").permitAll()
                        .pathMatchers("/api/v1/users/refresh-token").permitAll()
                        .pathMatchers("/api/v1/users/health").permitAll()
                        .pathMatchers("/actuator/**").permitAll()

                        // Todos los demás requieren JWT válido
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> {})
                );

        return http.build();
    }
}
