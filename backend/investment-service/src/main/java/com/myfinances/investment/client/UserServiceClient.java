package com.myfinances.investment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;
import java.util.UUID;

/**
 * Cliente Feign para consultar configuraciones del usuario en user-service.
 * Reemplaza el RestTemplate hardcodeado que existía en UserSettingsService.
 */
@FeignClient(
        name = "user-service",
        url = "${services.user-service.url:http://user-service:8084}",
        fallback = UserServiceClientFallback.class
)
public interface UserServiceClient {

    @GetMapping("/api/v1/users/profile")
    Map<String, Object> getUserProfile(@RequestHeader("X-User-Id") UUID userId);
}