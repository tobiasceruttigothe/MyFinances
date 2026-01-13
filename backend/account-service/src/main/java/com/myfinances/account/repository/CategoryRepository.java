package com.myfinances.account.repository;

import com.myfinances.account.model.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryType, Long> {

    // Buscar categoría por nombre
    Optional<CategoryType> findByNameIgnoreCase(String name);

    // Verificar si existe una categoría con ese nombre
    boolean existsByNameIgnoreCase(String name);
}

