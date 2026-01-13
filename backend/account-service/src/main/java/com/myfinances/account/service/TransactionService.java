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

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Guarda una nueva transacción
     */
    public Transaction save(TransactionDTO dto) {
        CategoryType category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoryId()));

        Transaction transaction = new Transaction();
        transaction.setDescription(dto.getDescription());
        transaction.setAmount(dto.getAmount());
        transaction.setType(dto.getType());
        transaction.setCategory(category);
        transaction.setDate(dto.getDate() != null ? dto.getDate() : LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    /**
     * Obtiene todas las transacciones
     */
    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    /**
     * Busca una transacción por ID
     */
    @Transactional(readOnly = true)
    public Transaction findById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada con ID: " + id));
    }

    /**
     * Actualiza una transacción existente
     */
    public Transaction update(Long id, TransactionDTO dto) {
        Transaction transaction = findById(id);

        if (dto.getCategoryId() != null) {
            CategoryType category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoryId()));
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

        return transactionRepository.save(transaction);
    }

    /**
     * Elimina una transacción
     */
    public void delete(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transacción no encontrada con ID: " + id);
        }
        transactionRepository.deleteById(id);
    }

    /**
     * Obtiene transacciones por tipo (INCOME/EXPENSE)
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByType(TransactionType type) {
        return transactionRepository.findByType(type);
    }

    /**
     * Obtiene transacciones por categoría
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByCategory(Long categoryId) {
        return transactionRepository.findByCategoryId(categoryId);
    }

    /**
     * Obtiene transacciones en un rango de fechas
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByDateBetween(startDate, endDate);
    }

    /**
     * Obtiene las últimas 10 transacciones
     */
    @Transactional(readOnly = true)
    public List<Transaction> findRecentTransactions() {
        return transactionRepository.findTop10ByOrderByDateDesc();
    }

    /**
     * Busca transacciones por descripción
     */
    @Transactional(readOnly = true)
    public List<Transaction> searchByDescription(String keyword) {
        return transactionRepository.findByDescriptionContainingIgnoreCase(keyword);
    }

    /**
     * Obtiene transacciones de un mes específico
     */
    @Transactional(readOnly = true)
    public List<Transaction> findByMonth(int year, int month) {
        return transactionRepository.findByYearAndMonth(year, month);
    }

    /**
     * Calcula el balance general (ingresos - gastos)
     */
    @Transactional(readOnly = true)
    public BalanceDTO calculateBalance() {
        BigDecimal totalIncome = transactionRepository.sumByType(TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumByType(TransactionType.EXPENSE);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        Long incomeCount = transactionRepository.countByType(TransactionType.INCOME);
        Long expenseCount = transactionRepository.countByType(TransactionType.EXPENSE);

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
    public BalanceDTO calculateBalanceByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal totalIncome = transactionRepository.sumByTypeAndDateBetween(TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.sumByTypeAndDateBetween(TransactionType.EXPENSE, startDate, endDate);
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
