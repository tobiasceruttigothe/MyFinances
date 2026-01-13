package com.myfinances.account.controller;

import com.myfinances.account.dto.TransactionDTO;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody TransactionDTO dto) {
        // En un caso real, mapeamos DTO a Entity aquí o en el servicio
        return ResponseEntity.ok(service.save(dto));
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }
}

