package com.myfinances.intake.client;

import com.myfinances.intake.dto.PhoneLookupResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Cliente Feign para resolver el remitente de WhatsApp (teléfono) → userId.
 */
@FeignClient(name = "user-service", url = "${services.user-service.url:http://user-service:8084}")
public interface UserServiceClient {

    /**
     * Devuelve el userId asociado a un teléfono verificado.
     * Lanza FeignException 404 si el teléfono no está vinculado/verificado.
     */
    @GetMapping("/api/v1/users/by-phone/{phone}")
    PhoneLookupResponse getUserByPhone(@PathVariable("phone") String phone);
}
