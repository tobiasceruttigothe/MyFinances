package com.myfinances.intake.controller;

import com.myfinances.intake.dto.IngestTextRequest;
import com.myfinances.intake.dto.IntakeReplyResponse;
import com.myfinances.intake.service.ElevenLabsSttService;
import com.myfinances.intake.service.TransactionIntakeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Endpoints que consume el bot de n8n.
 *
 * Flujo: WhatsApp → n8n (baja audio si aplica) → POST /api/v1/intake/text → este servicio.
 * La respuesta `reply` es el texto que n8n reenvía al usuario por WhatsApp.
 *
 * El intake-service NO pasa por el gateway: n8n lo expone hacia afuera. La seguridad
 * del webhook (HMAC de Meta) vive en n8n (Fase 3).
 */
@RestController
@RequestMapping("/api/v1/intake")
@RequiredArgsConstructor
@Slf4j
public class IntakeController {

    private final TransactionIntakeService intakeService;
    private final ElevenLabsSttService sttService;

    /**
     * Procesa un mensaje de texto. Sirve tanto para una nueva transacción como
     * para la confirmación ("OK").
     */
    @PostMapping("/text")
    public ResponseEntity<IntakeReplyResponse> ingestText(@Valid @RequestBody IngestTextRequest request) {
        log.debug("POST /intake/text - phone={}", request.getPhone());
        return ResponseEntity.ok(intakeService.handle(request.getPhone(), request.getText()));
    }

    /**
     * Procesa un audio de WhatsApp (Fase 2). n8n descarga el audio de Meta y lo manda
     * acá como multipart (campo `phone` + archivo `file`). Se transcribe con ElevenLabs
     * y el texto resultante entra al mismo pipeline que /text.
     */
    @PostMapping(value = "/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IntakeReplyResponse> ingestAudio(
            @RequestParam("phone") String phone,
            @RequestParam("file") MultipartFile file) {

        log.debug("POST /intake/audio - phone={}, {} bytes", phone, file.getSize());
        String text;
        try {
            text = sttService.transcribe(file.getBytes(), file.getOriginalFilename());
        } catch (Exception e) {
            log.error("Error transcribiendo audio de {}: {}", phone, e.getMessage());
            return ResponseEntity.ok(IntakeReplyResponse.builder()
                    .status(IntakeReplyResponse.Status.ERROR)
                    .reply("No pude entender el audio. Probá de nuevo o escribime el gasto por texto.")
                    .build());
        }
        return ResponseEntity.ok(intakeService.handle(phone, text));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "intake-service"));
    }
}
