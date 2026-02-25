package com.myfinances.investment.exception;

/**
 * Excepción para acceso denegado a recursos que no pertenecen al usuario
 */
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }
}
