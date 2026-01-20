package com.myfinances.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

// ======================== USER DTO ========================
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private UUID id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private Boolean enabled;

    // Settings
    private Boolean linkInvestmentsToTransactions;
    private String currency;
    private String timezone;
    private String language;
    private Boolean enableAutoGoalAssignments;
}