export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  userId: string
  email: string
  username: string
  firstName: string
  lastName: string
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface UserProfile {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  enabled: boolean
  linkInvestmentsToTransactions: boolean
  currency: string
  timezone: string
  language: string
  enableAutoGoalAssignments: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  linkInvestmentsToTransactions?: boolean
  currency?: string
  timezone?: string
  language?: string
  enableAutoGoalAssignments?: boolean
}
