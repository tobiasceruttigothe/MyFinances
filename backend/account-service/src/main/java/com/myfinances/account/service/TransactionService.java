package com.myfinances.account.service;

import com.myfinances.account.dto.*;
import com.myfinances.account.exception.AccessDeniedException;
import com.myfinances.account.exception.BadRequestException;
import com.myfinances.account.exception.ResourceNotFoundException;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.repository.CategoryRepository;
import com.myfinances.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;


    /**
     * ⭐ Guarda una nueva transacción
     */
    public Transaction save(UUID userId, CreateTransactionDTO dto) {
        log.debug("Creando transacción para usuario: {}, tipo: {}, monto: {}", userId, dto.getType(), dto.getAmount());

        CategoryType category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoryId()));

        // ⭐ Validar que la categoría pertenezca al usuario (o sea del sistema)
        if (category.getUserId() != null && !category.getUserId().equals(userId)) {
            log.warn("Usuario {} intentó usar categoría {} que no le pertenece", userId, dto.getCategoryId());
            throw new AccessDeniedException("La categoría no te pertenece");
        }

        // ⭐ MEJORA: Validar coherencia entre tipo de categoría y tipo de transacción
        if (category.getType() != null && category.getType() != dto.getType()) {
            log.warn("Usuario {} intentó crear transacción {} con categoría de tipo {}",
                    userId, dto.getType(), category.getType());
            throw new BadRequestException(
                    String.format("La categoría '%s' es de tipo %s y no puede usarse para una transacción de tipo %s",
                            category.getName(), category.getType(), dto.getType()));
        }

        // ⭐ MEJORA: Validar que si linkedToInvestment es true, investmentId no sea null
        if (Boolean.TRUE.equals(dto.getLinkedToInvestment()) && dto.getInvestmentId() == null) {
            throw new BadRequestException("Si la transacción está vinculada a una inversión, debe especificar el ID de la inversión");
        }

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .type(dto.getType())
                .category(category)
                .date(dto.getDate() != null ? dto.getDate() : LocalDateTime.now())
                .notes(dto.getNotes())
                .linkedToInvestment(dto.getLinkedToInvestment() != null ? dto.getLinkedToInvestment() : false)
                .investmentId(dto.getInvestmentId())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transacción creada exitosamente: ID={}, Usuario={}, Tipo={}, Monto={}",
                savedTransaction.getId(), userId, dto.getType(), dto.getAmount());

        return savedTransaction;
    }

    /**
     * Obtiene todas las transacciones de un usuario
     */
    @Transactional(readOnly = true)
    public List<Transaction> findAll(UUID userId) {
        log.debug("Obteniendo todas las transacciones para usuario: {}", userId);
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        log.debug("Encontradas {} transacciones para usuario: {}", transactions.size(), userId);
        return transactions;
    }

    /**
     * Busca una transacción por ID y valida que pertenezca al usuario
     */
    @Transactional(readOnly = true)
    public Transaction findById(UUID userId, Long id) {
        log.debug("Buscando transacción ID={} para usuario: {}", id, userId);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada con ID: " + id));

        if (!transaction.getUserId().equals(userId)) {
            log.warn("Usuario {} intentó acceder a transacción {} que no le pertenece", userId, id);
            throw new AccessDeniedException("Esta transacción no te pertenece");
        }

        log.debug("Transacción encontrada: ID={}, Tipo={}, Monto={}", id, transaction.getType(), transaction.getAmount());
        return transaction;
    }

    /**
     * Actualiza una transacción existente
     */
    public Transaction update(UUID userId, Long id, UpdateTransactionDTO dto) {
        log.debug("Actualizando transacción ID={} para usuario: {}", id, userId);

        Transaction transaction = findById(userId, id);

        if (dto.getDescription() != null) {
            transaction.setDescription(dto.getDescription());
        }
        if (dto.getAmount() != null) {
            transaction.setAmount(dto.getAmount());
        }
        if (dto.getType() != null) {
            transaction.setType(dto.getType());
        }
        if (dto.getCategoryId() != null) {
            CategoryType category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoryId()));
            if (category.getUserId() != null && !category.getUserId().equals(userId)) {
                log.warn("Usuario {} intentó usar categoría {} que no le pertenece en actualización", userId, dto.getCategoryId());
                throw new AccessDeniedException("La categoría no te pertenece");
            }

            // ⭐ MEJORA: Validar coherencia entre tipo de categoría y tipo de transacción
            TransactionType effectiveType = dto.getType() != null ? dto.getType() : transaction.getType();
            if (category.getType() != null && category.getType() != effectiveType) {
                log.warn("Usuario {} intentó actualizar transacción con categoría de tipo incorrecto", userId);
                throw new BadRequestException(
                        String.format("La categoría '%s' es de tipo %s y no puede usarse para una transacción de tipo %s",
                                category.getName(), category.getType(), effectiveType));
            }

            transaction.setCategory(category);
        }
        if (dto.getDate() != null) {
            transaction.setDate(dto.getDate());
        }
        if (dto.getNotes() != null) {
            transaction.setNotes(dto.getNotes());
        }

        Transaction updatedTransaction = transactionRepository.save(transaction);
        log.info("Transacción actualizada exitosamente: ID={}, Usuario={}", id, userId);
        return updatedTransaction;
    }

    /**
     * Elimina una transacción
     */
    public void delete(UUID userId, Long id) {
        log.debug("Eliminando transacción ID={} para usuario: {}", id, userId);
        Transaction transaction = findById(userId, id);
        transactionRepository.delete(transaction);
        log.info("Transacción eliminada exitosamente: ID={}, Usuario={}", id, userId);
    }

    /**
     * Obtiene transacciones por tipo (INCOME/EXPENSE)
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByType(UUID userId, TransactionType type) {
        log.debug("Buscando transacciones por tipo={} para usuario: {}", type, userId);
        return transactionRepository.findByUserIdAndType(userId, type);
    }

    /**
     * Obtiene transacciones por categoría
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByCategory(UUID userId, Long categoryId) {
        log.debug("Buscando transacciones por categoría={} para usuario: {}", categoryId, userId);
        return transactionRepository.findByUserIdAndCategoryId(userId, categoryId);
    }

    /**
     * Obtiene transacciones en un rango de fechas
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Buscando transacciones en rango [{} - {}] para usuario: {}", startDate, endDate, userId);

        // ⭐ Validación de rango de fechas
        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        return transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    /**
     * Obtiene las últimas 10 transacciones
     */
    @Transactional(readOnly = true)
    public List<Transaction> findRecentTransactions(UUID userId) {
        log.debug("Obteniendo últimas 10 transacciones para usuario: {}", userId);
        return transactionRepository.findTop10ByUserIdOrderByDateDesc(userId);
    }

    /**
     * Busca transacciones por descripción
     */
    @Transactional(readOnly = true)
    public List<Transaction> searchByDescription(UUID userId, String keyword) {
        log.debug("Buscando transacciones con keyword='{}' para usuario: {}", keyword, userId);

        // ⭐ Validación del keyword
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("El término de búsqueda no puede estar vacío");
        }
        if (keyword.length() < 2) {
            throw new BadRequestException("El término de búsqueda debe tener al menos 2 caracteres");
        }

        return transactionRepository.findByUserIdAndDescriptionContainingIgnoreCase(userId, keyword.trim());
    }

    /**
     * Obtiene transacciones de un mes específico
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByMonth(UUID userId, int year, int month) {
        log.debug("Buscando transacciones del mes {}/{} para usuario: {}", month, year, userId);

        // ⭐ Validación de mes y año
        if (month < 1 || month > 12) {
            throw new BadRequestException("El mes debe estar entre 1 y 12");
        }
        if (year < 1900 || year > 2100) {
            throw new BadRequestException("El año debe estar entre 1900 y 2100");
        }

        return transactionRepository.findByUserIdAndYearAndMonth(userId, year, month);
    }

    /**
     * Calcula el balance general (ingresos - gastos)
     */
    @Transactional(readOnly = true)
    public BalanceDTO calculateBalance(UUID userId) {
        log.debug("Calculando balance general para usuario: {}", userId);

        // ⭐ MEJORA: Manejar posibles nulls con valores por defecto
        BigDecimal totalIncome = transactionRepository.sumByUserIdAndType(userId, TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumByUserIdAndType(userId, TransactionType.EXPENSE);

        // Asegurar que no sean null (aunque la query usa COALESCE, es buena práctica)
        totalIncome = totalIncome != null ? totalIncome : BigDecimal.ZERO;
        totalExpense = totalExpense != null ? totalExpense : BigDecimal.ZERO;

        BigDecimal balance = totalIncome.subtract(totalExpense);

        Long incomeCount = transactionRepository.countByUserIdAndType(userId, TransactionType.INCOME);
        Long expenseCount = transactionRepository.countByUserIdAndType(userId, TransactionType.EXPENSE);

        // Asegurar que no sean null
        incomeCount = incomeCount != null ? incomeCount : 0L;
        expenseCount = expenseCount != null ? expenseCount : 0L;

        log.debug("Balance calculado para usuario {}: ingresos={}, gastos={}, balance={}",
                userId, totalIncome, totalExpense, balance);

        return BalanceDTO.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .incomeTransactionCount(incomeCount)
                .expenseTransactionCount(expenseCount)
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Calcula el balance en un rango de fechas
     */
    @Transactional(readOnly = true)
    public BalanceDTO calculateBalanceByDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal totalIncome = transactionRepository.sumByUserIdAndTypeAndDateBetween(userId, TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.sumByUserIdAndTypeAndDateBetween(userId, TransactionType.EXPENSE, startDate, endDate);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        return BalanceDTO.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .periodStart(startDate)
                .periodEnd(endDate)
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    public TransactionResponseDTO toResponseDTO(Transaction transaction) {
        return TransactionResponseDTO.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : null)
                .date(transaction.getDate())
                .notes(transaction.getNotes())
                .linkedToInvestment(transaction.getLinkedToInvestment())
                .investmentId(transaction.getInvestmentId())
                .build();
    }

    /**
     * Convierte una lista de transacciones a DTOs
     */
    public List<TransactionResponseDTO> toResponseDTOList(List<Transaction> transactions) {
        return transactions.stream()
                .map(this::toResponseDTO)
                .toList();
    }
}