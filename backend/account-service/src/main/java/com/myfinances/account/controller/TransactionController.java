package com.myfinances.account.controller;

import com.myfinances.account.dto.BalanceDTO;
import com.myfinances.account.dto.TransactionDTO;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * ⭐ IMPORTANTE: El userId viene del header X-User-Id que pone el Gateway después de validar el JWT
 */
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    /**
     * Crear una nueva transacción
     */
    @PostMapping
    public ResponseEntity<TransactionDTO> create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody TransactionDTO dto) {
        Transaction transaction = service.save(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.toDTO(transaction));
    }

    /**
     * Obtener todas las transacciones
     */
    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAll(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(service.toDTOList(service.findAll(userId)));
    }

    /**
     * Obtener una transacción por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getById(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(service.toDTO(service.findById(userId, id)));
    }

    /**
     * Actualizar una transacción
     */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> update(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id,
            @RequestBody TransactionDTO dto) {
        Transaction transaction = service.update(userId, id, dto);
        return ResponseEntity.ok(service.toDTO(transaction));
    }

    /**
     * Eliminar una transacción
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        service.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener transacciones por tipo (INCOME/EXPENSE)
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<TransactionDTO>> getByType(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable TransactionType type) {
        return ResponseEntity.ok(service.toDTOList(service.findByType(userId, type)));
    }

    /**
     * Obtener transacciones por categoría
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TransactionDTO>> getByCategory(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(service.toDTOList(service.findByCategory(userId, categoryId)));
    }

    /**
     * Obtener transacciones en un rango de fechas
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<TransactionDTO>> getByDateRange(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(service.toDTOList(service.findByDateRange(userId, startDate, endDate)));
    }

    /**
     * Obtener transacciones de un mes específico
     */
    @GetMapping("/month")
    public ResponseEntity<List<TransactionDTO>> getByMonth(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(service.toDTOList(service.findByMonth(userId, year, month)));
    }

    /**
     * Obtener las últimas 10 transacciones
     */
    @GetMapping("/recent")
    public ResponseEntity<List<TransactionDTO>> getRecentTransactions(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(service.toDTOList(service.findRecentTransactions(userId)));
    }

    /**
     * Buscar transacciones por descripción
     */
    @GetMapping("/search")
    public ResponseEntity<List<TransactionDTO>> searchByDescription(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam String keyword) {
        return ResponseEntity.ok(service.toDTOList(service.searchByDescription(userId, keyword)));
    }

    /**
     * Obtener el balance general
     */
    @GetMapping("/balance")
    public ResponseEntity<BalanceDTO> getBalance(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(service.calculateBalance(userId));
    }

    /**
     * Obtener el balance en un rango de fechas
     */
    @GetMapping("/balance/date-range")
    public ResponseEntity<BalanceDTO> getBalanceByDateRange(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(service.calculateBalanceByDateRange(userId, startDate, endDate));
    }
}