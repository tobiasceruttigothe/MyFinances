package com.myfinances.intake.config;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provee el cliente de Anthropic como bean singleton.
 * La API key se inyecta desde la propiedad `anthropic.api-key`
 * (que a su vez sale de la variable de entorno ANTHROPIC_API_KEY / Secret de K8s).
 */
@Configuration
public class AnthropicConfig {

    @Bean
    public AnthropicClient anthropicClient(@Value("${anthropic.api-key:}") String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            // No abortamos el arranque: el servicio levanta igual y falla solo
            // al intentar parsear (útil para que el resto del sistema no dependa de esto).
            return AnthropicOkHttpClient.fromEnv();
        }
        return AnthropicOkHttpClient.builder()
                .apiKey(apiKey)
                .build();
    }
}
