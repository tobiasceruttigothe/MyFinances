package com.myfinances.account.service;

import com.myfinances.account.dto.BalanceDTO;
import com.myfinances.account.dto.TransactionDTO;
import com.myfinances.account.exception.ResourceNotFoundException;
import com.myfinances.account.model.CategoryType;
import com.myfinances.account.model.Transaction;
import com.myfinances.account.model.TransactionType;
import com.myfinances.account.repository.CategoryRepository;
import com.myfinances.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    /**
     * ⭐ Guarda una nueva transacción
     */
    public Transaction save(UUID userId, TransactionDTO dto) {
        CategoryType category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoryId()));

        // ⭐ Validar que la categoría pertenezca al usuario (o sea del sistema)
        if (category.getUserId() != null && !category.getUserId().equals(userId)) {
            throw new RuntimeException("La categoría no te pertenece");
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

        return transactionRepository.save(transaction);
    }

    /**
     * Obtiene todas las transacciones de un usuario
     */
    @Transactional(readOnly = true)
    public List<Transaction> findAll(UUID userId) {
        return transactionRepository.findByUserId(userId);
    }

    /**
     * Busca una transacción por ID y valida que pertenezca al usuario
     */
    @Transactional(readOnly = true)
    public Transaction findById(UUID userId, Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada con ID: " + id));

        if (!transaction.getUserId().equals(userId)) {
            throw new RuntimeException("Esta transacción no te pertenece");
        }

        return transaction;
    }

    /**
     * Actualiza una transacción existente
     */
    public Transaction update(UUID userId, Long id, TransactionDTO dto) {
        Transaction transaction = findById(userId, id);

        if (dto.getCategoryId() != null) {
            CategoryType category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoryId()));

            // ⭐ Validar que la categoría pertenezca al usuario (o sea del sistema)
            if (category.getUserId() != null && !category.getUserId().equals(userId)) {
                throw new RuntimeException("La categoría no te pertenece");
            }

            transaction.setCategory(category);
        }

        if (dto.getDescription() != null) {
            transaction.setDescription(dto.getDescription());
        }
        if (dto.getAmount() != null) {
            transaction.setAmount(dto.getAmount());
        }
        if (dto.getType() != null) {
            transaction.setType(dto.getType());
        }
        if (dto.getDate() != null) {
            transaction.setDate(dto.getDate());
        }
        if (dto.getNotes() != null) {
            transaction.setNotes(dto.getNotes());
        }

        return transactionRepository.save(transaction);
    }

    /**
     * Elimina una transacción
     */
    public void delete(UUID userId, Long id) {
        Transaction transaction = findById(userId, id);
        transactionRepository.delete(transaction);
    }

    /**
     * Obtiene transacciones por tipo (INCOME/EXPENSE)
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByType(UUID userId, TransactionType type) {
        return transactionRepository.findByUserIdAndType(userId, type);
    }

    /**
     * Obtiene transacciones por categoría
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByCategory(UUID userId, Long categoryId) {
        return transactionRepository.findByUserIdAndCategoryId(userId, categoryId);
    }

    /**
     * Obtiene transacciones en un rango de fechas
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    /**
     * Obtiene las últimas 10 transacciones
     */
    @Transactional(readOnly = true)
    public List<Transaction> findRecentTransactions(UUID userId) {
        return transactionRepository.findTop10ByUserIdOrderByDateDesc(userId);
    }

    /**
     * Busca transacciones por descripción
     */
    @Transactional(readOnly = true)
    public List<Transaction> searchByDescription(UUID userId, String keyword) {
        return transactionRepository.findByUserIdAndDescriptionContainingIgnoreCase(userId, keyword);
    }

    /**
     * Obtiene transacciones de un mes específico
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByMonth(UUID userId, int year, int month) {
        return transactionRepository.findByUserIdAndYearAndMonth(userId, year, month);
    }

    /**
     * Calcula el balance general (ingresos - gastos)
     */
    @Transactional(readOnly = true)
    public BalanceDTO calculateBalance(UUID userId) {
        BigDecimal totalIncome = transactionRepository.sumByUserIdAndType(userId, TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumByUserIdAndType(userId, TransactionType.EXPENSE);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        Long incomeCount = transactionRepository.countByUserIdAndType(userId, TransactionType.INCOME);
        Long expenseCount = transactionRepository.countByUserIdAndType(userId, TransactionType.EXPENSE);

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

    /**
     * Convierte una entidad Transaction a DTO
     */
    public TransactionDTO toDTO(Transaction transaction) {
        return TransactionDTO.builder()
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
    public List<TransactionDTO> toDTOList(List<Transaction> transactions) {
        return transactions.stream()
                .map(this::toDTO)
                .toList();
    }
}