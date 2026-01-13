package com.myfinances.account.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "category_types")
@NoArgsConstructor
@AllArgsConstructor
public class CategoryType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String name; // Ej: "HOGAR", "COMIDA", "TRANSPORTE", etc.

}