package com.myfinances.intake.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respuesta del intake-service hacia n8n. `reply` es el texto literal que n8n
 * reenvía al usuario por WhatsApp. `status` permite a n8n ramificar si hace falta.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntakeReplyResponse {

    public enum Status {
        /** El teléfono no está vinculado a ninguna cuenta verificada. */
        NOT_LINKED,
        /** No se entendió el mensaje como una transacción. */
        NOT_UNDERSTOOD,
        /** Se parseó una transacción y se espera confirmación (OK / corregir). */
        NEEDS_CONFIRMATION,
        /** La transacción se creó en account-service. */
        CREATED,
        /** Se canceló la transacción pendiente. */
        CANCELLED,
        /** Error procesando (IA caída, account-service caído, etc.). */
        ERROR
    }

    private Status status;
    private String reply;

    /** ID de la transacción creada (solo cuando status == CREATED). */
    private Long transactionId;
}
