package com.myfinances.account.controller;

import com.myfinances.account.dto.CategoryDTO;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.service.CategoryInitializationService;
import com.myfinances.account.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * ⭐ IMPORTANTE: El userId viene del header X-User-Id que pone el Gateway después de validar el JWT
 */
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;
    private final CategoryInitializationService initService;

    /**
     * Crear una nueva categoría
     */
    @PostMapping
    public ResponseEntity<CategoryDTO> create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CategoryDTO dto) {
        CategoryType category = service.create(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.toDTO(userId, category));
    }

    /**
     * Obtener todas las categorías del usuario
     */
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAll(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(service.toDTOList(userId, service.findAllByUser(userId)));
    }

    /**
     * Obtener categorías raíz (sin padre)
     */
    @GetMapping("/root")
    public ResponseEntity<List<CategoryDTO>> getRootCategories(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(service.toDTOList(userId, service.findRootCategories(userId)));
    }

    /**
     * Obtener subcategorías de una categoría padre
     */
    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<List<CategoryDTO>> getSubcategories(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long parentId) {
        return ResponseEntity.ok(service.toDTOList(userId, service.findSubcategories(userId, parentId)));
    }

    /**
     * Obtener una categoría por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getById(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(service.toDTO(userId, service.findById(userId, id)));
    }

    /**
     * Obtener una categoría por nombre
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<CategoryDTO> getByName(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String name) {
        return ResponseEntity.ok(service.toDTO(userId, service.findByName(userId, name)));
    }

    /**
     * Actualizar una categoría
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> update(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO dto) {
        CategoryType category = service.update(userId, id, dto);
        return ResponseEntity.ok(service.toDTO(userId, category));
    }

    /**
     * Eliminar una categoría
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable Long id) {
        service.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * ⭐ ENDPOINT ESPECIAL: Inicializar categorías para un nuevo usuario
     * Este endpoint es llamado por user-service cuando se registra un usuario
     * NO requiere header X-User-Id porque viene en el path
     */
    @PostMapping("/initialize-for-user/{userId}")
    public ResponseEntity<Void> initializeUserCategories(@PathVariable UUID userId) {
        initService.initializeUserCategories(userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}