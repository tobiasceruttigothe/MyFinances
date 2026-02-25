package com.myfinances.goals.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Cliente Feign para account-service.
 *
 * Se usa en el scheduler de aportes automáticos para verificar
 * que el usuario tiene saldo disponible en el mes.
 * Con circuit breaker: si account-service no responde, el aporte
 * automático igual se registra (modo optimista).
 */
@FeignClient(name = "account-service", url = "${services.account-service.url:http://account-service:8081}")
public interface AccountServiceClient {

    /**
     * Obtiene el balance del usuario en un rango de fechas (mes específico)
     */
    @GetMapping("/api/v1/transactions/balance/date-range")
    Map<String, Object> getBalanceByDateRange(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate
    );
}