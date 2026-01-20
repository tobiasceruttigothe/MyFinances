package com.myfinances.gateway_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Configuración de seguridad para el Gateway
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        // ⭐ Endpoints públicos (sin autenticación)
                        .pathMatchers("/api/v1/users/register").permitAll()
                        .pathMatchers("/api/v1/users/login").permitAll()
                        .pathMatchers("/api/v1/users/refresh-token").permitAll()
                        .pathMatchers("/api/v1/users/health").permitAll()
                        .pathMatchers("/actuator/**").permitAll()

                        // ⭐ Todos los demás endpoints requieren autenticación
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> {})
                );

        return http.build();
    }
}