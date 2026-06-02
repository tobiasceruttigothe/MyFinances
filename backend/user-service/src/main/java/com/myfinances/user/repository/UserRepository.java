package com.myfinances.user.repository;

import com.myfinances.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    // Resolución teléfono → usuario para el intake-service (solo teléfonos verificados).
    Optional<User> findByPhoneAndPhoneVerifiedTrue(String phone);

    // Para detectar si otro usuario ya reclamó/verificó este número.
    Optional<User> findByPhone(String phone);
}

// ==========================================
