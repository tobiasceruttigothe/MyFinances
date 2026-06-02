package com.myfinances.intake.controller;

import com.myfinances.intake.dto.IngestTextRequest;
import com.myfinances.intake.dto.IntakeReplyResponse;
import com.myfinances.intake.service.TransactionIntakeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    /**
     * Procesa un mensaje de texto (o el texto transcripto de un audio, Fase 2).
     * Sirve tanto para una nueva transacción como para la confirmación ("OK").
     */
    @PostMapping("/text")
    public ResponseEntity<IntakeReplyResponse> ingestText(@Valid @RequestBody IngestTextRequest request) {
        log.debug("POST /intake/text - phone={}", request.getPhone());
        return ResponseEntity.ok(intakeService.handle(request.getPhone(), request.getText()));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "intake-service"));
    }
}
