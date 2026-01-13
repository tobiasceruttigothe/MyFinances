package com.myfinances.account.config;

import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.repository.CategoryRepository;
import com.myfinances.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Inicializa datos de prueba al arrancar la aplicación
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Inicializando datos de prueba...");

        initializeCategories();
        initializeSampleTransactions();

        log.info("Datos de prueba inicializados correctamente.");
    }

    private void initializeCategories() {
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
                log.debug("Categoría creada: {}", categoryName);
            }
        }
    }

    private void initializeSampleTransactions() {
        if (transactionRepository.count() > 0) {
            return;
        }

        CategoryType salario = categoryRepository.findByNameIgnoreCase("SALARIO").orElse(null);
        CategoryType comida = categoryRepository.findByNameIgnoreCase("COMIDA").orElse(null);
        CategoryType transporte = categoryRepository.findByNameIgnoreCase("TRANSPORTE").orElse(null);
        CategoryType servicios = categoryRepository.findByNameIgnoreCase("SERVICIOS").orElse(null);
        CategoryType entretenimiento = categoryRepository.findByNameIgnoreCase("ENTRETENIMIENTO").orElse(null);

        if (salario != null) {
            createTransaction("Salario Enero", new BigDecimal("50000.00"), TransactionType.INCOME, salario, LocalDateTime.now().minusDays(30));
            createTransaction("Salario Febrero", new BigDecimal("50000.00"), TransactionType.INCOME, salario, LocalDateTime.now().minusDays(1));
        }

        if (comida != null) {
            createTransaction("Supermercado", new BigDecimal("8500.00"), TransactionType.EXPENSE, comida, LocalDateTime.now().minusDays(25));
            createTransaction("Restaurante", new BigDecimal("3200.00"), TransactionType.EXPENSE, comida, LocalDateTime.now().minusDays(20));
            createTransaction("Delivery", new BigDecimal("1500.00"), TransactionType.EXPENSE, comida, LocalDateTime.now().minusDays(10));
        }

        if (transporte != null) {
            createTransaction("Combustible", new BigDecimal("5000.00"), TransactionType.EXPENSE, transporte, LocalDateTime.now().minusDays(15));
            createTransaction("SUBE", new BigDecimal("2000.00"), TransactionType.EXPENSE, transporte, LocalDateTime.now().minusDays(5));
        }

        if (servicios != null) {
            createTransaction("Electricidad", new BigDecimal("4500.00"), TransactionType.EXPENSE, servicios, LocalDateTime.now().minusDays(12));
            createTransaction("Internet", new BigDecimal("3500.00"), TransactionType.EXPENSE, servicios, LocalDateTime.now().minusDays(8));
            createTransaction("Gas", new BigDecimal("2800.00"), TransactionType.EXPENSE, servicios, LocalDateTime.now().minusDays(3));
        }

        if (entretenimiento != null) {
            createTransaction("Netflix", new BigDecimal("1200.00"), TransactionType.EXPENSE, entretenimiento, LocalDateTime.now().minusDays(7));
            createTransaction("Spotify", new BigDecimal("400.00"), TransactionType.EXPENSE, entretenimiento, LocalDateTime.now().minusDays(2));
        }
    }

    private void createTransaction(String description, BigDecimal amount, TransactionType type, CategoryType category, LocalDateTime date) {
        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setCategory(category);
        transaction.setDate(date);
        transactionRepository.save(transaction);
        log.debug("Transacción creada: {} - ${}", description, amount);
    }
}
