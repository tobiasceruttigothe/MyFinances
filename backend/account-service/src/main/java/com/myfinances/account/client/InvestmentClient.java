package com.myfinances.account.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.math.BigDecimal;

// "name" debe coincidir con el nombre en Eureka del otro servicio (INVESTMENT-SERVICE)
@FeignClient(name = "investment-service")
public interface InvestmentClient {

    @GetMapping("/api/v1/investments/user/{userId}")
    BigDecimal getTotalInvestmentByUserId(@PathVariable("userId") Long userId);
}