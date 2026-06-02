package com.myfinances.intake;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients // ⭐ IMPORTANTE: Habilitar Feign (user-service + account-service)
public class IntakeServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(IntakeServiceApplication.class, args);
	}
}
