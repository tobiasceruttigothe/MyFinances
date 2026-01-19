package com.myfinances.account.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.math.BigDecimal;


@FeignClient(name = "investment-service", url = "http://investment-service:8083")
public interface InvestmentClient {

    @GetMapping("/api/v1/investments/user/{userId}")
    BigDecimal getTotalInvestmentByUserId(@PathVariable("userId") Long userId);
}