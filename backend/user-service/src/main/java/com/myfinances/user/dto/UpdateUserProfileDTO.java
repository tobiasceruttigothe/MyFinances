package com.myfinances.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileDTO {

    @Size(max = 50)
    private String firstName;

    @Size(max = 50)
    private String lastName;

    // Settings opcionales
    private Boolean linkInvestmentsToTransactions;

    @Size(min = 3, max = 3, message = "El código de moneda debe ser ISO 4217 (3 letras)")
    private String currency;

    private String timezone;

    @Size(min = 2, max = 5)
    private String language;

    private Boolean enableAutoGoalAssignments;
}