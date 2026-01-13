package com.myfinances.account.service;

import com.myfinances.account.dto.CategoryDTO;
import com.myfinances.account.exception.BadRequestException;
import com.myfinances.account.exception.ResourceNotFoundException;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.repository.CategoryRepository;
import com.myfinances.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Crea una nueva categoría
     */
    public CategoryType create(CategoryDTO dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Ya existe una categoría con el nombre: " + dto.getName());
        }

        CategoryType category = new CategoryType();
        category.setName(dto.getName().toUpperCase());

        return categoryRepository.save(category);
    }

    /**
     * Obtiene todas las categorías
     */
    @Transactional(readOnly = true)
    public List<CategoryType> findAll() {
        return categoryRepository.findAll();
    }

    /**
     * Busca una categoría por ID
     */
    @Transactional(readOnly = true)
    public CategoryType findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
    }

    /**
     * Busca una categoría por nombre
     */
    @Transactional(readOnly = true)
    public CategoryType findByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con nombre: " + name));
    }

    /**
     * Actualiza una categoría
     */
    public CategoryType update(Long id, CategoryDTO dto) {
        CategoryType category = findById(id);

        if (!category.getName().equalsIgnoreCase(dto.getName()) &&
                categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Ya existe una categoría con el nombre: " + dto.getName());
        }

        category.setName(dto.getName().toUpperCase());
        return categoryRepository.save(category);
    }

    /**
     * Elimina una categoría
     */
    public void delete(Long id) {
        CategoryType category = findById(id);

        List<?> transactions = transactionRepository.findByCategoryId(id);
        if (!transactions.isEmpty()) {
            throw new BadRequestException("No se puede eliminar la categoría porque tiene " +
                    transactions.size() + " transacciones asociadas");
        }

        categoryRepository.delete(category);
    }

    /**
     * Obtiene el total gastado/ingresado por categoría
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalByCategory(Long categoryId) {
        return transactionRepository.sumByCategoryId(categoryId);
    }

    /**
     * Convierte una entidad CategoryType a DTO con datos enriquecidos
     */
    public CategoryDTO toDTO(CategoryType category) {
        Long transactionCount = (long) transactionRepository.findByCategoryId(category.getId()).size();
        BigDecimal totalAmount = transactionRepository.sumByCategoryId(category.getId());

        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .transactionCount(transactionCount)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * Convierte una lista de categorías a DTOs
     */
    public List<CategoryDTO> toDTOList(List<CategoryType> categories) {
        return categories.stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Inicializa categorías por defecto si no existen
     */
    public void initializeDefaultCategories() {
        String[] defaultCategories = {
                "HOGAR", "COMIDA", "TRANSPORTE", "SALUD", "ENTRETENIMIENTO",
                "EDUCACION", "ROPA", "SERVICIOS", "AHORRO", "SALARIO",
                "FREELANCE", "INVERSIONES", "OTROS"
        };

        for (String categoryName : defaultCategories) {
            if (!categoryRepository.existsByNameIgnoreCase(categoryName)) {
                CategoryType category = new CategoryType();
                category.setName(categoryName);
                categoryRepository.save(category);
            }
        }
    }
}
