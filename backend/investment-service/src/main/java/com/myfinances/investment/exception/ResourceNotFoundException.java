package com.myfinances.investment.exception;

// ==================== CUSTOM EXCEPTIONS ====================

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}