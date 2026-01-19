package com.myfinances.account.controller;


import com.myfinances.account.dto.BalanceDTO;
import com.myfinances.account.dto.TransactionDTO;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;
    /**
     * Crear una nueva transacción
     */
    @PostMapping
    public ResponseEntity<TransactionDTO> create(@Valid @RequestBody TransactionDTO dto) {
        Transaction transaction = service.save(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.toDTO(transaction));
    }

    /**
     * Obtener todas las transacciones
     */
    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAll() {
        return ResponseEntity.ok(service.toDTOList(service.findAll()));
    }

    /**
     * Obtener una transacción por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.toDTO(service.findById(id)));
    }

    /**
     * Actualizar una transacción
     */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> update(@PathVariable Long id, @RequestBody TransactionDTO dto) {
        Transaction transaction = service.update(id, dto);
        return ResponseEntity.ok(service.toDTO(transaction));
    }

    /**
     * Eliminar una transacción
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener transacciones por tipo (INCOME/EXPENSE)
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<TransactionDTO>> getByType(@PathVariable TransactionType type) {
        return ResponseEntity.ok(service.toDTOList(service.findByType(type)));
    }

    /**
     * Obtener transacciones por categoría
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TransactionDTO>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(service.toDTOList(service.findByCategory(categoryId)));
    }

    /**
     * Obtener transacciones en un rango de fechas
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<TransactionDTO>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(service.toDTOList(service.findByDateRange(startDate, endDate)));
    }

    /**
     * Obtener transacciones de un mes específico
     */
    @GetMapping("/month")
    public ResponseEntity<List<TransactionDTO>> getByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(service.toDTOList(service.findByMonth(year, month)));
    }

    /**
     * Obtener las últimas 10 transacciones
     */
    @GetMapping("/recent")
    public ResponseEntity<List<TransactionDTO>> getRecentTransactions() {
        return ResponseEntity.ok(service.toDTOList(service.findRecentTransactions()));
    }

    /**
     * Buscar transacciones por descripción
     */
    @GetMapping("/search")
    public ResponseEntity<List<TransactionDTO>> searchByDescription(@RequestParam String keyword) {
        return ResponseEntity.ok(service.toDTOList(service.searchByDescription(keyword)));
    }

    /**
     * Obtener el balance general
     */
    @GetMapping("/balance")
    public ResponseEntity<BalanceDTO> getBalance() {
        return ResponseEntity.ok(service.calculateBalance());
    }

    /**
     * Obtener el balance en un rango de fechas
     */
    @GetMapping("/balance/date-range")
    public ResponseEntity<BalanceDTO> getBalanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(service.calculateBalanceByDateRange(startDate, endDate));
    }


    // Inyectamos el valor desde GitHub
    @Value("${myfinances.message:Error al cargar}")
    private String message;

    @GetMapping("/test-config")
    public ResponseEntity<String> testConfig() {
        return ResponseEntity.ok("Mensaje del Config Server: " + message);
    }

}
