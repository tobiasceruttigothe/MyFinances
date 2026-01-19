package com.myfinances.gateway_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity // Importante: Usamos WebFlux porque es Gateway (Netty), no Web (Tomcat)
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity serverHttpSecurity) {
        serverHttpSecurity
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Deshabilitamos CSRF para APIs REST
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/actuator/**").permitAll()
                        // Permitir login (si tuviéramos endpoint de login propio, aquí no aplica tanto)
                        // PROTEGER todo lo que sea API de negocio
                        .pathMatchers("/api/v1/**").authenticated()
                        // Cualquier otra cosa, autenticada
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())); // Habilitar validación JWT

        return serverHttpSecurity.build();
    }
}