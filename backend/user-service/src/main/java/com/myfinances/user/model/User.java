package com.myfinances.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Usuario del sistema - El ID es el UUID de Keycloak
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id; // ⭐ UUID de Keycloak (NO generado por JPA)

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    // ⭐ Teléfono para vincular la cuenta con WhatsApp (intake-service).
    // unique permite múltiples NULL en Postgres; solo un usuario puede reclamar un número.
    @Column(unique = true, length = 25)
    private String phone;

    // Solo los teléfonos verificados se aceptan para crear transacciones por WhatsApp.
    // columnDefinition con default a nivel DB para que el ALTER funcione sobre filas existentes
    // (ddl-auto=update no puede agregar una columna NOT NULL sin default a una tabla con datos).
    // @Builder.Default: sin esto, User.builder() ignora el inicializador y guarda null → viola NOT NULL.
    @Builder.Default
    @Column(name = "phone_verified", nullable = false, columnDefinition = "boolean default false")
    private Boolean phoneVerified = false;

    // Código de verificación de un solo uso + expiración.
    // Fase 3: el código se enviará por WhatsApp. Por ahora se loguea (ver UserService).
    @Column(name = "phone_verification_code", length = 10)
    private String phoneVerificationCode;

    @Column(name = "phone_verification_expires_at")
    private LocalDateTime phoneVerificationExpiresAt;

    @Column(nullable = false)
    private Boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relación con configuraciones
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserSettings settings;
}