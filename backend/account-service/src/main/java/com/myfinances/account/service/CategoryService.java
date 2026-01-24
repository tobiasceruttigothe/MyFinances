package com.myfinances.account.service;

import com.myfinances.account.dto.*;
import com.myfinances.account.exception.BadRequestException;
import com.myfinances.account.exception.ResourceNotFoundException;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.repository.CategoryRepository;
import com.myfinances.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    /**
     * ⭐ Crea una nueva categoría para un usuario
     */
    public CategoryType create(UUID userId, CreateCategoryDTO dto) {
        // Validar que no exista una categoría con ese nombre para el usuario
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, dto.getName())) {
            throw new BadRequestException("Ya tienes una categoría con el nombre: " + dto.getName());
        }

        // Si tiene parentId, validar que exista
        if (dto.getParentId() != null) {
            CategoryType parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría padre no encontrada"));

            // ⭐ Validar que la categoría padre pertenezca al usuario O sea del sistema
            if (parent.getUserId() != null && !parent.getUserId().equals(userId)) {
                throw new BadRequestException("La categoría padre no te pertenece");
            }

            // Validar que la categoría padre sea del mismo tipo
            if (parent.getType() != dto.getType()) {
                throw new BadRequestException("La categoría padre debe ser del mismo tipo (INCOME/EXPENSE)");
            }
        }

        CategoryType category = CategoryType.builder()
                .userId(userId)
                .name(dto.getName().toUpperCase())
                .type(dto.getType())
                .parentId(dto.getParentId())
                .isSystem(false)
                .description(dto.getDescription())
                .build();

        return categoryRepository.save(category);
    }

    /**
     * Obtiene todas las categorías de un usuario
     */
    @Transactional(readOnly = true)
    public List<CategoryType> findAllByUser(UUID userId) {
        return categoryRepository.findByUserId(userId);
    }

    /**
     * Obtiene categorías raíz (sin padre) de un usuario
     */
    @Transactional(readOnly = true)
    public List<CategoryType> findRootCategories(UUID userId) {
        return categoryRepository.findByUserIdAndParentIdIsNull(userId);
    }

    /**
     * Obtiene subcategorías de una categoría padre
     */
    @Transactional(readOnly = true)
    public List<CategoryType> findSubcategories(UUID userId, Long parentId) {
        return categoryRepository.findByUserIdAndParentId(userId, parentId);
    }

    /**
     * Busca una categoría por ID y valida que pertenezca al usuario
     */
    @Transactional(readOnly = true)
    public CategoryType findById(UUID userId, Long id) {
        CategoryType category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        // ⭐ Validar que la categoría pertenezca al usuario (o sea del sistema)
        if (category.getUserId() != null && !category.getUserId().equals(userId)) {
            throw new BadRequestException("Esta categoría no te pertenece");
        }

        return category;
    }

    /**
     * Busca una categoría por nombre de un usuario
     */
    @Transactional(readOnly = true)
    public CategoryType findByName(UUID userId, String name) {
        return categoryRepository.findByUserIdAndNameIgnoreCase(userId, name)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con nombre: " + name));
    }

    /**
     * Actualiza una categoría
     */
    public CategoryType update(UUID userId, Long id, UpdateCategoryDTO dto) {
        CategoryType category = findById(userId, id);

        // ⭐ No permitir modificar categorías del sistema
        if (category.getUserId() == null) {
            throw new BadRequestException("No puedes modificar categorías del sistema");
        }

        // Validar cambio de nombre
        if (dto.getName() != null) {
            if (!category.getName().equalsIgnoreCase(dto.getName()) &&
                    categoryRepository.existsByUserIdAndNameIgnoreCase(userId, dto.getName())) {
                throw new BadRequestException("Ya tienes una categoría con el nombre: " + dto.getName());
            }
            category.setName(dto.getName().toUpperCase());
        }

        // Validar cambio de padre
        if (dto.getParentId() != null && !dto.getParentId().equals(category.getParentId())) {
            // No permitir crear ciclos (categoría padre = categoría hija)
            if (dto.getParentId().equals(id)) {
                throw new BadRequestException("Una categoría no puede ser padre de sí misma");
            }

            CategoryType newParent = findById(userId, dto.getParentId());

            if (newParent.getType() != category.getType()) {
                throw new BadRequestException("La categoría padre debe ser del mismo tipo");
            }

            category.setParentId(dto.getParentId());
        }

        if (dto.getDescription() != null) {
            category.setDescription(dto.getDescription());
        }

        return categoryRepository.save(category);
    }

    /**
     * Elimina una categoría
     */
    public void delete(UUID userId, Long id) {
        CategoryType category = findById(userId, id);

        // ⭐ No permitir eliminar categorías del sistema
        if (category.getUserId() == null) {
            throw new BadRequestException("No puedes eliminar categorías del sistema");
        }

        // Verificar que no tenga transacciones asociadas
        List<Transaction> transactions = transactionRepository.findByUserIdAndCategoryId(userId, id);
        if (!transactions.isEmpty()) {
            throw new BadRequestException("No puedes eliminar la categoría porque tiene " +
                    transactions.size() + " transacciones asociadas");
        }

        // Verificar que no tenga subcategorías
        List<CategoryType> subcategories = categoryRepository.findByUserIdAndParentId(userId, id);
        if (!subcategories.isEmpty()) {
            throw new BadRequestException("No puedes eliminar la categoría porque tiene " +
                    subcategories.size() + " subcategorías");
        }

        categoryRepository.delete(category);
    }

    /**
     * Obtiene el total gastado/ingresado por categoría
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalByCategory(UUID userId, Long categoryId) {
        // Validar que la categoría pertenezca al usuario
        findById(userId, categoryId);
        return transactionRepository.sumByUserIdAndCategoryId(userId, categoryId);
    }

    // ==================== MAPEO A DTOs ====================

    /**
     * Convierte una entidad CategoryType a ResponseDTO con datos enriquecidos
     */
    public CategoryResponseDTO toResponseDTO(CategoryType category) {
        // Si es categoría del sistema, userId será null
        UUID userId = category.getUserId();

        Long transactionCount = 0L;
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Solo calcular si es una categoría de usuario (no del sistema)
        if (userId != null) {
            transactionCount = (long) transactionRepository
                    .findByUserIdAndCategoryId(userId, category.getId()).size();
            totalAmount = transactionRepository
                    .sumByUserIdAndCategoryId(userId, category.getId());
        }

        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .parentId(category.getParentId())
                .description(category.getDescription())
                .transactionCount(transactionCount)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * Convierte una lista de categorías a ResponseDTOs
     */
    public List<CategoryResponseDTO> toResponseDTOList(List<CategoryType> categories) {
        return categories.stream()
                .map(this::toResponseDTO)
                .toList();
    }
}