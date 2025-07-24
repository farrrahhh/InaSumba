import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  user_id: string
  email: string
  name: string
}

interface AuthStore {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (userData: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData: AuthUser) =>
        set({
          user: userData,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-store',
    }
  )
)