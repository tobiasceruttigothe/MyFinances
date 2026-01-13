package com.myfinances.account.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "transactions")
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String description; // Ej: "Pago de Luz"

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;  // Ej: 5000.00

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType type; // INCOME o EXPENSE

    @ManyToOne
    @JoinColumn(name = "category_id")
    private CategoryType category; // Ej: "HOGAR", "COMIDA"

    @Column(nullable = false)
    private LocalDateTime date;
}
