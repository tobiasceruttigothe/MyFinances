package com.myfinances.intake.model;

import java.math.BigDecimal;

/**
 * Salida estructurada que Claude debe devolver al parsear el mensaje del usuario.
 * El SDK de Anthropic deriva el JSON Schema desde este record (structured outputs)
 * y devuelve una instancia ya tipada.
 *
 * La semántica de cada campo se explica en el system prompt (ClaudeParsingService),
 * no acá, para no acoplar el schema a prosa frágil.
 */
public record ParsedTransaction(
        boolean understood,
        BigDecimal amount,
        String type,        // "INCOME" | "EXPENSE"
        String category,    // nombre de una de las categorías del usuario
        String description, // descripción corta de la transacción
        String notes        // notas adicionales (puede venir vacío)
) {
}
