package com.myfinances.account.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;


@Entity
@Data
@Table(name = "category_types")
@NoArgsConstructor
@AllArgsConstructor
public class CategoryType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String name; // Ej: "HOGAR", "COMIDA", "TRANSPORTE", etc.

    @OneToMany
    @JoinColumn(name = "transaction_id")
    private List<Transaction> transaction;

}