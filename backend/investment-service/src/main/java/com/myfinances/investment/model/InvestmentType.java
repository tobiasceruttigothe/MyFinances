package com.myfinances.investment.model;

/**
 * Tipos de inversión válidos
 */
public enum InvestmentType {
    ACCION("Acciones"),
    BONO("Bonos"),
    PLAZO_FIJO("Plazo Fijo"),
    CRYPTO("Criptomonedas"),
    FONDO("Fondos de Inversión"),
    ETF("ETF"),
    INMUEBLE("Inmuebles"),
    CEDEAR("CEDEARs"),
    DIVISA("Divisas/Forex"),
    COMMODITIES("Commodities"),
    OTRO("Otro");

    private final String displayName;

    InvestmentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Valida si un string es un tipo de inversión válido
     */
    public static boolean isValid(String type) {
        if (type == null) return false;
        try {
            valueOf(type.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Obtiene el tipo de inversión desde un string, o OTRO si no es válido
     */
    public static InvestmentType fromString(String type) {
        if (type == null) return OTRO;
        try {
            return valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return OTRO;
        }
    }
}
