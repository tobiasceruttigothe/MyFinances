package com.myfinances.user.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.UUID;

/**
 * Cliente Feign para comunicarse con account-service
 */
@FeignClient(name = "account-service", url = "${services.account-service.url:http://account-service:8081}")
public interface AccountServiceClient {

    /**
     * ⭐ Inicializa las categorías predefinidas para un nuevo usuario
     */
    @PostMapping("/api/v1/categories/initialize-for-user/{userId}")
    void initializeUserCategories(@PathVariable("userId") UUID userId);
}