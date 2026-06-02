package com.myfinances.intake.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Cliente Feign para account-service. account-service confía en el header
 * X-User-Id (mismo patrón que el resto de servicios downstream — el intake-service
 * lo setea con el userId resuelto desde el teléfono).
 */
@FeignClient(name = "account-service", url = "${services.account-service.url:http://account-service:8081}")
public interface AccountServiceClient {

    /**
     * Lista las categorías del usuario. Se usan para:
     * (1) dárselas a Claude en el prompt como conjunto válido de destinos, y
     * (2) resolver el nombre de categoría → id al crear la transacción.
     */
    @GetMapping("/api/v1/categories")
    List<Map<String, Object>> getCategories(@RequestHeader("X-User-Id") UUID userId);

    /**
     * Crea una transacción. Mismo contrato que usa el frontend / investment-service.
     */
    @PostMapping("/api/v1/transactions")
    Map<String, Object> createTransaction(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Map<String, Object> transactionData
    );
}
