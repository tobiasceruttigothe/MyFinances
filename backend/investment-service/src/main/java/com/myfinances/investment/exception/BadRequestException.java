package com.myfinances.investment.exception;

/**
 * Excepción para peticiones con datos inválidos
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
