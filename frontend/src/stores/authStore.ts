import { create } from 'zustand'
import type { UserProfile } from '@/types/auth'

interface AuthState {
  accessToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: UserProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setTokens: (accessToken, refreshToken) => {
    // Defensive: never persist undefined/null/empty. Otherwise localStorage.setItem
    // coerces them to the literal strings "undefined"/"null" — which read back as
    // truthy and poison the session forever (the bug fixed in c0b2e94 manifested
    // this way before the backend started returning camelCase).
    if (!accessToken || !refreshToken) {
      console.error('setTokens called with invalid token(s)', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      })
      return
    }
    localStorage.setItem('refreshToken', refreshToken)
    set({ accessToken, isAuthenticated: true })
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('refreshToken')
    set({ accessToken: null, user: null, isAuthenticated: false })
  },
}))
