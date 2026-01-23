package com.myfinances.investment.service;

import com.myfinances.investment.client.AccountServiceClient;
import com.myfinances.investment.dto.InvestmentDTO;
import com.myfinances.investment.dto.InvestmentSummaryDTO;
import com.myfinances.investment.dto.PortfolioSummaryDTO;
import com.myfinances.investment.exception.ResourceNotFoundException;
import com.myfinances.investment.model.Investment;
import com.myfinances.investment.repository.InvestmentRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final AccountServiceClient accountServiceClient;
    private final UserSettingsService userSettingsService;

    /**
     * ⭐ Crea una nueva inversión
     */
    public Investment create(UUID userId, InvestmentDTO dto) {
        Investment investment = Investment.builder()
                .userId(userId)
                .type(dto.getType().toUpperCase())
                .description(dto.getDescription())
                .initialCapital(dto.getInitialCapital())
                .currentCapital(dto.getCurrentCapital())
                .investmentDate(dto.getInvestmentDate() != null ? dto.getInvestmentDate() : LocalDateTime.now())
                .notes(dto.getNotes())
                .linkedTransactionCreated(false)
                .build();

        investment = investmentRepository.save(investment);
        log.info("Inversión creada: ID={}, User={}, Type={}", investment.getId(), userId, investment.getType());

        // ⭐ Verificar si el usuario tiene habilitada la vinculación automática
        boolean shouldCreateTransaction = dto.getCreateLinkedTransaction() != null
                ? dto.getCreateLinkedTransaction()
                : userSettingsService.shouldLinkInvestmentsToTransactions(userId);

        if (shouldCreateTransaction) {
            try {
                createLinkedTransaction(userId, investment);
            } catch (Exception e) {
                log.error("Error creando transacción vinculada para inversión {}: {}", investment.getId(), e.getMessage());
                // No fallar la creación de la inversión si falla la transacción
            }
        }

        return investment;
    }

    /**
     * Crea una transacción en account-service vinculada a esta inversión
     */
    @CircuitBreaker(name = "accountServiceBreaker", fallbackMethod = "fallbackCreateTransaction")
    private void createLinkedTransaction(UUID userId, Investment investment) {
        // Buscar o usar categoría "INVERSIONES" por defecto
        Map<String, Object> transactionData = new HashMap<>();
        transactionData.put("description", "Inversión: " + investment.getDescription());
        transactionData.put("amount", investment.getInitialCapital());
        transactionData.put("type", "EXPENSE");
        transactionData.put("categoryId", 1L); // TODO: Buscar dinámicamente la categoría "Inversiones"
        transactionData.put("notes", "Transacción automática desde investment-service");
        transactionData.put("linkedToInvestment", true);
        transactionData.put("investmentId", investment.getId());

        Map<String, Object> response = accountServiceClient.createTransaction(userId, transactionData);

        if (response != null && response.containsKey("id")) {
            investment.setLinkedTransactionCreated(true);
            investment.setTransactionId(((Number) response.get("id")).longValue());
            investmentRepository.save(investment);
            log.info("Transacción vinculada creada: ID={} para inversión={}", investment.getTransactionId(), investment.getId());
        }
    }

    /**
     * Fallback si account-service no está disponible
     */
    private void fallbackCreateTransaction(UUID userId, Investment investment, Throwable t) {
        log.warn("Account-service no disponible. Inversión creada sin transacción vinculada. Error: {}", t.getMessage());
    }

    /**
     * Obtiene todas las inversiones de un usuario
     */
    @Transactional(readOnly = true)
    public List<Investment> findAll(UUID userId) {
        return investmentRepository.findByUserId(userId);
    }

    /**
     * Busca una inversión por ID y valida que pertenezca al usuario
     */
    @Transactional(readOnly = true)
    public Investment findById(UUID userId, Long id) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inversión no encontrada con ID: " + id));

        if (!investment.getUserId().equals(userId)) {
            throw new RuntimeException("Esta inversión no te pertenece");
        }

        return investment;
    }

    /**
     * Obtiene inversiones por tipo
     */
    @Transactional(readOnly = true)
    public List<Investment> findByType(UUID userId, String type) {
        return investmentRepository.findByUserIdAndType(userId, type.toUpperCase());
    }

    /**
     * Actualiza una inversión
     */
    public Investment update(UUID userId, Long id, InvestmentDTO dto) {
        Investment investment = findById(userId, id);

        if (dto.getType() != null) {
            investment.setType(dto.getType().toUpperCase());
        }
        if (dto.getDescription() != null) {
            investment.setDescription(dto.getDescription());
        }
        if (dto.getCurrentCapital() != null) {
            investment.setCurrentCapital(dto.getCurrentCapital());
        }
        if (dto.getNotes() != null) {
            investment.setNotes(dto.getNotes());
        }

        return investmentRepository.save(investment);
    }

    /**
     * Elimina una inversión
     */
    public void delete(UUID userId, Long id) {
        Investment investment = findById(userId, id);

        // Si hay transacción vinculada, intentar eliminarla también
        if (investment.getLinkedTransactionCreated() && investment.getTransactionId() != null) {
            try {
                accountServiceClient.deleteTransaction(userId, investment.getTransactionId());
                log.info("Transacción vinculada eliminada: ID={}", investment.getTransactionId());
            } catch (Exception e) {
                log.error("Error eliminando transacción vinculada {}: {}", investment.getTransactionId(), e.getMessage());
            }
        }

        investmentRepository.delete(investment);
        log.info("Inversión eliminada: ID={}", id);
    }

    /**
     * ⭐ Calcula el valor total de inversiones para un usuario
     * Este método es llamado por account-service vía Feign
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalInvestmentValue(UUID userId) {
        return investmentRepository.sumCurrentCapitalByUserId(userId);
    }

    /**
     * Obtiene el resumen del portfolio de inversiones
     */
    @Transactional(readOnly = true)
    public PortfolioSummaryDTO getPortfolioSummary(UUID userId) {
        List<Investment> investments = investmentRepository.findByUserId(userId);

        if (investments.isEmpty()) {
            return PortfolioSummaryDTO.builder()
                    .totalInvested(BigDecimal.ZERO)
                    .totalCurrentValue(BigDecimal.ZERO)
                    .totalProfit(BigDecimal.ZERO)
                    .overallROI(BigDecimal.ZERO)
                    .totalInvestments(0L)
                    .byType(Collections.emptyList())
                    .calculatedAt(LocalDateTime.now())
                    .build();
        }

        BigDecimal totalInvested = investments.stream()
                .map(Investment::getInitialCapital)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCurrentValue = investments.stream()
                .map(Investment::getCurrentCapital)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalProfit = totalCurrentValue.subtract(totalInvested);

        BigDecimal overallROI = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            overallROI = totalProfit
                    .divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Agrupar por tipo
        List<InvestmentSummaryDTO> byType = investments.stream()
                .collect(Collectors.groupingBy(Investment::getType))
                .entrySet()
                .stream()
                .map(entry -> {
                    String type = entry.getKey();
                    List<Investment> typeInvestments = entry.getValue();

                    BigDecimal typeInitial = typeInvestments.stream()
                            .map(Investment::getInitialCapital)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal typeCurrent = typeInvestments.stream()
                            .map(Investment::getCurrentCapital)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal typeProfit = typeCurrent.subtract(typeInitial);

                    BigDecimal typeROI = BigDecimal.ZERO;
                    if (typeInitial.compareTo(BigDecimal.ZERO) > 0) {
                        typeROI = typeProfit
                                .divide(typeInitial, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100));
                    }

                    return InvestmentSummaryDTO.builder()
                            .type(type)
                            .count((long) typeInvestments.size())
                            .totalInitialCapital(typeInitial)
                            .totalCurrentCapital(typeCurrent)
                            .totalProfit(typeProfit)
                            .averageROI(typeROI)
                            .build();
                })
                .sorted(Comparator.comparing(InvestmentSummaryDTO::getTotalCurrentCapital).reversed())
                .collect(Collectors.toList());

        return PortfolioSummaryDTO.builder()
                .totalInvested(totalInvested)
                .totalCurrentValue(totalCurrentValue)
                .totalProfit(totalProfit)
                .overallROI(overallROI)
                .totalInvestments((long) investments.size())
                .byType(byType)
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Convierte Investment a DTO
     */
    public InvestmentDTO toDTO(Investment investment) {
        return InvestmentDTO.builder()
                .id(investment.getId())
                .type(investment.getType())
                .description(investment.getDescription())
                .initialCapital(investment.getInitialCapital())
                .currentCapital(investment.getCurrentCapital())
                .investmentDate(investment.getInvestmentDate())
                .notes(investment.getNotes())
                .profit(investment.getProfit())
                .roi(investment.getROI())
                .linkedTransactionCreated(investment.getLinkedTransactionCreated())
                .transactionId(investment.getTransactionId())
                .createdAt(investment.getCreatedAt())
                .updatedAt(investment.getUpdatedAt())
                .build();
    }

    /**
     * Convierte lista de inversiones a DTOs
     */
    public List<InvestmentDTO> toDTOList(List<Investment> investments) {
        return investments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}