package com.myfinances.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDTO {

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

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}