package com.myfinances.intake.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Speech-to-Text con ElevenLabs (modelo Scribe). Recibe los bytes del audio de
 * WhatsApp (que n8n descarga de Meta) y devuelve el texto transcripto, que luego
 * entra al mismo pipeline que un mensaje de texto.
 *
 * API: POST {base}/v1/speech-to-text  (multipart: model_id + file), header xi-api-key.
 * La key sale de ELEVENLABS_API_KEY (Secret de K8s).
 */
@Service
@Slf4j
public class ElevenLabsSttService {

    private final RestClient restClient;
    private final String apiKey;
    private final String modelId;

    public ElevenLabsSttService(
            @Value("${elevenlabs.base-url:https://api.elevenlabs.io}") String baseUrl,
            @Value("${elevenlabs.api-key:}") String apiKey,
            @Value("${elevenlabs.model:scribe_v1}") String modelId) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.modelId = modelId;
    }

    public String transcribe(byte[] audio, String filename) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("model_id", modelId);
        // ByteArrayResource con filename: ElevenLabs lo espera como parte de archivo.
        body.add("file", new ByteArrayResource(audio) {
            @Override
            public String getFilename() {
                return (filename != null && !filename.isBlank()) ? filename : "audio.ogg";
            }
        });

        log.debug("Transcribiendo audio con ElevenLabs (modelo={}, {} bytes)", modelId, audio.length);

        Map<?, ?> response = restClient.post()
                .uri("/v1/speech-to-text")
                .header("xi-api-key", apiKey)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(Map.class);

        Object text = response != null ? response.get("text") : null;
        if (text == null || text.toString().isBlank()) {
            throw new IllegalStateException("ElevenLabs no devolvió texto transcripto");
        }
        log.debug("Audio transcripto: {}", text);
        return text.toString();
    }
}
