package com.myfinances.account.controller;

import com.myfinances.account.dto.CategoryDTO;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    /**
     * Crear una nueva categoría
     */
    @PostMapping
    public ResponseEntity<CategoryDTO> create(@Valid @RequestBody CategoryDTO dto) {
        CategoryType category = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.toDTO(category));
    }

    /**
     * Obtener todas las categorías
     */
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAll() {
        return ResponseEntity.ok(service.toDTOList(service.findAll()));
    }

    /**
     * Obtener una categoría por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.toDTO(service.findById(id)));
    }

    /**
     * Obtener una categoría por nombre
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<CategoryDTO> getByName(@PathVariable String name) {
        return ResponseEntity.ok(service.toDTO(service.findByName(name)));
    }

    /**
     * Actualizar una categoría
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> update(@PathVariable Long id, @Valid @RequestBody CategoryDTO dto) {
        CategoryType category = service.update(id, dto);
        return ResponseEntity.ok(service.toDTO(category));
    }

    /**
     * Eliminar una categoría
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Inicializar categorías por defecto
     */
    @PostMapping("/initialize-defaults")
    public ResponseEntity<List<CategoryDTO>> initializeDefaults() {
        service.initializeDefaultCategories();
        return ResponseEntity.ok(service.toDTOList(service.findAll()));
    }
}

