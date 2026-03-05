import axios from 'axios'
import { apiClient } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, UserProfile } from '@/types/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// Use raw axios for public endpoints (no auth interceptor needed)
const publicClient = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } })

export const authApi = {
  register: (data: RegisterRequest) =>
    publicClient.post<UserProfile>('/api/v1/users/register', data).then((r) => r.data),

  // Called after a Google/social PKCE flow — idempotent, creates DB record if not exists
  socialRegister: (data: { email: string; firstName: string; lastName: string }) =>
    apiClient.post<UserProfile>('/api/v1/users/social-register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    publicClient.post<AuthResponse>('/api/v1/users/login', data).then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    publicClient
      .post<AuthResponse>('/api/v1/users/refresh-token', { refreshToken })
      .then((r) => r.data),

  getProfile: () =>
    apiClient.get<UserProfile>('/api/v1/users/profile').then((r) => r.data),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<UserProfile>('/api/v1/users/profile', data).then((r) => r.data),

  deleteAccount: () =>
    apiClient.delete('/api/v1/users/profile').then((r) => r.data),
}
