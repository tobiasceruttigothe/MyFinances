package com.myfinances.goals.model;

public enum ContributionType {
    /**
     * El usuario agregó el aporte manualmente desde el panel
     */
    MANUAL,

    /**
     * El scheduler lo registró automáticamente el 1ro del mes
     */
    AUTO,

    /**
     * El usuario corrigió un aporte previo (positivo o negativo)
     */
    ADJUSTMENT
}