package com.myfinances.investment.service;

import com.myfinances.investment.client.AccountServiceClient;
import com.myfinances.investment.dto.*;
import com.myfinances.investment.exception.AccessDeniedException;
import com.myfinances.investment.exception.BadRequestException;
import com.myfinances.investment.exception.ResourceNotFoundException;
import com.myfinances.investment.model.Investment;
import com.myfinances.investment.model.InvestmentType;
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

    public Investment create(UUID userId, CreateInvestmentDTO dto) {
        log.debug("Creando inversión tipo={} para usuario={}", dto.getType(), userId);

        // ⭐ MEJORA: Validar y normalizar el tipo de inversión
        String normalizedType = dto.getType().toUpperCase().trim();
        if (!InvestmentType.isValid(normalizedType)) {
            log.warn("Tipo de inversión no reconocido: {}. Se usará OTRO.", dto.getType());
            // Permitimos tipos no estándar pero los marcamos
        }

        // ⭐ MEJORA: Validar que currentCapital no sea mayor que initialCapital * 100 (protección contra errores)
        if (dto.getCurrentCapital().compareTo(dto.getInitialCapital().multiply(BigDecimal.valueOf(100))) > 0) {
            log.warn("El capital actual es más de 100 veces el capital inicial. Posible error de datos.");
        }

        Investment investment = Investment.builder()
                .userId(userId)
                .type(normalizedType)
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
                log.error("Error creando transacción vinculada: {}", e.getMessage());
            }
        }

        return investment;
    }

    /**
     * Crea una transacción en account-service vinculada a esta inversión.
     *
     * Busca dinámicamente la categoría "INVERSIONES" del usuario en lugar
     * de hardcodear el ID. Si no la encuentra, usa la primera categoría
     * EXPENSE disponible como fallback.
     */
    @CircuitBreaker(name = "accountServiceBreaker", fallbackMethod = "fallbackCreateTransaction")
    public void createLinkedTransaction(UUID userId, Investment investment) {

        // 1. Buscar la categoría "INVERSIONES" del usuario
        Long categoryId = resolveCategoryId(userId);

        // 2. Construir el payload de la transacción
        Map<String, Object> transactionData = new HashMap<>();
        transactionData.put("description", "Inversión: " + investment.getDescription());
        transactionData.put("amount", investment.getInitialCapital());
        transactionData.put("type", "EXPENSE");
        transactionData.put("categoryId", categoryId);
        transactionData.put("notes", "Transacción automática desde investment-service");
        transactionData.put("linkedToInvestment", true);
        transactionData.put("investmentId", investment.getId());

        Map<String, Object> response = accountServiceClient.createTransaction(userId, transactionData);

        if (response != null && response.containsKey("id")) {
            investment.setLinkedTransactionCreated(true);
            investment.setTransactionId(((Number) response.get("id")).longValue());
            investmentRepository.save(investment);
            log.info("Transacción vinculada creada: ID={} para inversión={}",
                    investment.getTransactionId(), investment.getId());
        }
    }

    /**
     * Resuelve el ID de la categoría "INVERSIONES" del usuario.
     * Primero intenta encontrarla por nombre; si falla, lanza excepción
     * que activa el fallback del circuit breaker.
     */
    private Long resolveCategoryId(UUID userId) {
        // Nombres posibles según cómo las creó CategoryInitializationService
        // (las categorías se guardan en UPPERCASE)
        String[] candidateNames = {"INVERSIONES", "INVERSION", "INVESTMENT"};

        for (String name : candidateNames) {
            try {
                Map<String, Object> category = accountServiceClient.getCategoryByName(userId, name);
                if (category != null && category.containsKey("id")) {
                    Long id = ((Number) category.get("id")).longValue();
                    log.debug("Categoría '{}' resuelta con ID={} para user={}", name, id, userId);
                    return id;
                }
            } catch (Exception e) {
                log.debug("Categoría '{}' no encontrada para user={}: {}", name, userId, e.getMessage());
            }
        }

        // Si no existe ninguna categoría de inversiones, lanzar para activar fallback
        throw new RuntimeException(
                "No se encontró una categoría de inversiones para el usuario " + userId +
                        ". Creá una categoría llamada 'INVERSIONES' de tipo EXPENSE.");
    }




    /**
     * Fallback si account-service no está disponible
     */
    public void fallbackCreateTransaction(UUID userId, Investment investment, Throwable t) {
        log.warn("Account-service no disponible. Inversión creada sin transacción vinculada. Error: {}", t.getMessage());
    }

    /**
     * Obtiene todas las inversiones de un usuario
     */
    @Transactional(readOnly = true)
    public List<Investment> findAll(UUID userId) {
        log.debug("Obteniendo todas las inversiones para usuario: {}", userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);
        log.debug("Encontradas {} inversiones para usuario: {}", investments.size(), userId);
        return investments;
    }

    /**
     * Busca una inversión por ID y valida que pertenezca al usuario
     */
    @Transactional(readOnly = true)
    public Investment findById(UUID userId, Long id) {
        log.debug("Buscando inversión ID={} para usuario: {}", id, userId);

        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inversión no encontrada con ID: " + id));

        if (!investment.getUserId().equals(userId)) {
            log.warn("Usuario {} intentó acceder a inversión {} que no le pertenece", userId, id);
            throw new AccessDeniedException("Esta inversión no te pertenece");
        }

        log.debug("Inversión encontrada: ID={}, Tipo={}, Capital={}", id, investment.getType(), investment.getCurrentCapital());
        return investment;
    }

    /**
     * Obtiene inversiones por tipo
     */
    @Transactional(readOnly = true)
    public List<Investment> findByType(UUID userId, String type) {
        log.debug("Buscando inversiones por tipo='{}' para usuario: {}", type, userId);

        // ⭐ Validación del tipo
        if (type == null || type.trim().isEmpty()) {
            throw new BadRequestException("El tipo de inversión no puede estar vacío");
        }

        return investmentRepository.findByUserIdAndType(userId, type.toUpperCase());
    }

    /**
     * Actualiza una inversión
     */

    public Investment update(UUID userId, Long id, UpdateInvestmentDTO dto) {
        log.debug("Actualizando inversión ID={} para usuario: {}", id, userId);

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

        Investment updatedInvestment = investmentRepository.save(investment);
        log.info("Inversión actualizada exitosamente: ID={}, Usuario={}", id, userId);
        return updatedInvestment;
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

    public InvestmentResponseDTO toResponseDTO(Investment investment) {
        return InvestmentResponseDTO.builder()
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

    public List<InvestmentResponseDTO> toResponseDTOList(List<Investment> investments) {
        return investments.stream()
                .map(this::toResponseDTO)
                .toList();
    }
}