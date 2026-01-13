package com.myfinances.account.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description; // Ej: "Pago de Luz"
    private BigDecimal amount;  // Ej: 5000.00

    @Enumerated(EnumType.STRING)
    private TransactionType type; // INCOME o EXPENSE

    private String category; // Ej: "HOGAR", "COMIDA"

    private LocalDateTime date;
}
