package com.myfinances.intake.service;

import com.myfinances.intake.model.ParsedTransaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Almacén en memoria de transacciones pendientes de confirmación, indexado por teléfono.
 *
 * MVP a propósito: si el servicio se reinicia, las pendientes se pierden (el usuario
 * simplemente reenvía el mensaje). Si más adelante se quiere persistencia o varias
 * réplicas, mover a Redis con el mismo TTL.
 */
@Component
@Slf4j
public class PendingConfirmationStore {

    /** Transacción parseada a la espera de un "OK", con la categoría ya resuelta a id. */
    public record Pending(UUID userId, ParsedTransaction tx, Long categoryId, Instant createdAt) {
    }

    private final ConcurrentHashMap<String, Pending> byPhone = new ConcurrentHashMap<>();
    private final Duration ttl;

    public PendingConfirmationStore(@Value("${intake.pending-ttl-seconds:600}") long ttlSeconds) {
        this.ttl = Duration.ofSeconds(ttlSeconds);
    }

    public void put(String phone, Pending pending) {
        byPhone.put(phone, pending);
    }

    /** Devuelve la pendiente vigente; si expiró, la elimina y devuelve vacío. */
    public Optional<Pending> get(String phone) {
        Pending p = byPhone.get(phone);
        if (p == null) {
            return Optional.empty();
        }
        if (Instant.now().isAfter(p.createdAt().plus(ttl))) {
            byPhone.remove(phone);
            log.debug("Pendiente expirada para teléfono {}", phone);
            return Optional.empty();
        }
        return Optional.of(p);
    }

    public void remove(String phone) {
        byPhone.remove(phone);
    }
}
