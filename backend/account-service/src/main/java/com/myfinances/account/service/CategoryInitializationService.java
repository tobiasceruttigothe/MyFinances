package com.myfinances.account.service;

import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Servicio para inicializar categorías del sistema y de usuarios
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryInitializationService implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    /**
     * ⭐ Se ejecuta al iniciar la aplicación - Crea categorías del sistema si no existen
     */
    @Override
    public void run(String... args) {
        initializeSystemCategories();
    }

    /**
     * 🏗️ Crea las categorías TEMPLATE del sistema (userId = NULL)
     */
    @Transactional
    public void initializeSystemCategories() {
        if (categoryRepository.countByIsSystemTrue() > 0) {
            log.info("Categorías del sistema ya existen, omitiendo inicialización");
            return;
        }

        log.info("Inicializando categorías del sistema...");

        List<CategoryType> systemCategories = new ArrayList<>();

        // ===================== INGRESOS =====================
        systemCategories.add(createSystemCategory("Salario", TransactionType.INCOME, null, "Ingresos por trabajo en relación de dependencia"));
        systemCategories.add(createSystemCategory("Dividendos", TransactionType.INCOME, null, "Ganancias de inversiones"));
        systemCategories.add(createSystemCategory("Alquileres", TransactionType.INCOME, null, "Ingresos por alquiler de propiedades"));
        systemCategories.add(createSystemCategory("Inversiones", TransactionType.EXPENSE, null, "Gastos destinados a inversiones financieras"));

        // ===================== GASTOS =====================

        // HOGAR (con subcategorías)
        CategoryType hogar = createSystemCategory("Hogar", TransactionType.EXPENSE, null, "Gastos del hogar");
        systemCategories.add(hogar);

        // Guardar para obtener el ID
        hogar = categoryRepository.save(hogar);

        // Subcategorías de Hogar
        systemCategories.add(createSystemCategory("Supermercado", TransactionType.EXPENSE, hogar.getId(), "Compras de alimentos y productos"));
        systemCategories.add(createSystemCategory("Luz", TransactionType.EXPENSE, hogar.getId(), "Servicio eléctrico"));
        systemCategories.add(createSystemCategory("Gas", TransactionType.EXPENSE, hogar.getId(), "Servicio de gas"));
        systemCategories.add(createSystemCategory("Agua", TransactionType.EXPENSE, hogar.getId(), "Servicio de agua"));
        systemCategories.add(createSystemCategory("Alquiler", TransactionType.EXPENSE, hogar.getId(), "Pago de alquiler mensual"));

        // TRANSPORTE (con subcategorías)
        CategoryType transporte = createSystemCategory("Transporte", TransactionType.EXPENSE, null, "Gastos de transporte");
        systemCategories.add(transporte);

        transporte = categoryRepository.save(transporte);

        systemCategories.add(createSystemCategory("Seguro Auto", TransactionType.EXPENSE, transporte.getId(), "Seguro del vehículo"));
        systemCategories.add(createSystemCategory("Combustible Auto", TransactionType.EXPENSE, transporte.getId(), "Combustible del vehículo"));

        // OTRAS CATEGORÍAS (sin subcategorías)
        systemCategories.add(createSystemCategory("Salud", TransactionType.EXPENSE, null, "Gastos médicos y salud"));
        systemCategories.add(createSystemCategory("Educación", TransactionType.EXPENSE, null, "Gastos educativos"));
        systemCategories.add(createSystemCategory("Entretenimiento", TransactionType.EXPENSE, null, "Ocio y entretenimiento"));

        categoryRepository.saveAll(systemCategories);

        log.info("✅ Categorías del sistema creadas: {}", systemCategories.size());
    }

    /**
     * 👤 Crea las categorías personales para un usuario nuevo
     * Clona las categorías del sistema y las asigna al usuario
     */
    @Transactional
    public void initializeUserCategories(UUID userId) {
        // Verificar que no tenga categorías ya
        if (categoryRepository.countByUserId(userId) > 0) {
            log.warn("El usuario {} ya tiene categorías, omitiendo inicialización", userId);
            return;
        }

        log.info("Inicializando categorías para usuario: {}", userId);

        // Obtener todas las categorías del sistema
        List<CategoryType> systemCategories = categoryRepository.findByIsSystemTrue();

        if (systemCategories.isEmpty()) {
            log.error("No hay categorías del sistema para clonar");
            return;
        }

        // Map para mantener la relación entre IDs antiguos y nuevos
        Map<Long, Long> oldIdToNewId = new HashMap<>();

        // Primera pasada: crear categorías padre (parentId = null)
        List<CategoryType> parentCategories = systemCategories.stream()
                .filter(cat -> cat.getParentId() == null)
                .toList();

        for (CategoryType systemCat : parentCategories) {
            CategoryType userCat = CategoryType.builder()
                    .userId(userId)
                    .name(systemCat.getName())
                    .type(systemCat.getType())
                    .parentId(null)
                    .isSystem(false)
                    .description(systemCat.getDescription())
                    .build();

            userCat = categoryRepository.save(userCat);
            oldIdToNewId.put(systemCat.getId(), userCat.getId());
        }

        // Segunda pasada: crear subcategorías (parentId != null)
        List<CategoryType> childCategories = systemCategories.stream()
                .filter(cat -> cat.getParentId() != null)
                .toList();

        for (CategoryType systemCat : childCategories) {
            Long newParentId = oldIdToNewId.get(systemCat.getParentId());

            if (newParentId == null) {
                log.error("No se encontró el nuevo ID para el padre: {}", systemCat.getParentId());
                continue;
            }

            CategoryType userCat = CategoryType.builder()
                    .userId(userId)
                    .name(systemCat.getName())
                    .type(systemCat.getType())
                    .parentId(newParentId)
                    .isSystem(false)
                    .description(systemCat.getDescription())
                    .build();

            categoryRepository.save(userCat);
        }

        long totalCreated = categoryRepository.countByUserId(userId);
        log.info("✅ Categorías creadas para usuario {}: {}", userId, totalCreated);
    }

    /**
     * Helper para crear una categoría del sistema
     */
    private CategoryType createSystemCategory(String name, TransactionType type, Long parentId, String description) {
        return CategoryType.builder()
                .userId(null) // ⭐ NULL = categoría del sistema
                .name(name)
                .type(type)
                .parentId(parentId)
                .isSystem(true)
                .description(description)
                .build();
    }
}