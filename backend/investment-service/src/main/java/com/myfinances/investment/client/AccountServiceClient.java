package com.myfinances.investment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Cliente Feign para comunicarse con account-service.
 */
@FeignClient(name = "account-service", url = "${services.account-service.url:http://account-service:8081}")
public interface AccountServiceClient {

    /**
     * Crea una transacción de tipo EXPENSE vinculada a una inversión.
     */
    @PostMapping("/api/v1/transactions")
    Map<String, Object> createTransaction(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Map<String, Object> transactionData
    );

    /**
     * Elimina una transacción vinculada.
     */
    @DeleteMapping("/api/v1/transactions/{transactionId}")
    void deleteTransaction(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable("transactionId") Long transactionId
    );

    /**
     * Busca una categoría del usuario por nombre exacto (case-insensitive).
     * Se usa para encontrar dinámicamente la categoría "Inversiones" al crear
     * una transacción vinculada, en lugar de hardcodear un ID.
     */
    @GetMapping("/api/v1/categories/name/{name}")
    Map<String, Object> getCategoryByName(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable("name") String name
    );
}