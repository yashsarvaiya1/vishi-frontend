// stores/authStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'


interface AuthCredentials {
  mobile_number: string
  password:      string
  username:      string | null
  is_superuser:  boolean
  user_id?:      number | null
}

interface AuthState {
  mobile_number: string
  password:      string
  username:      string | null
  is_superuser:  boolean
  isLoggedIn:    boolean
  user_id:       number | null   // ← ADDED here too

  setAuth:         (data: AuthCredentials) => void
  updateUsername:  (username: string | null) => void
  clearAuth:       () => void
  isAuthenticated: () => boolean
}

const EMPTY: Omit<AuthState, 'setAuth' | 'updateUsername' | 'clearAuth' | 'isAuthenticated'> = {
  mobile_number: '',
  password:      '',
  username:      null,
  is_superuser:  false,
  isLoggedIn:    false,
  user_id:       null,           // ← ADDED here too
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      setAuth: (data) =>
        set({
          mobile_number: data.mobile_number,
          password:      data.password,
          username:      data.username,
          is_superuser:  data.is_superuser,
          isLoggedIn:    true,
          user_id:       data.user_id ?? null,  // ← ADDED here too
        }),

      updateUsername: (username) => set({ username }),
      clearAuth:      () => set({ ...EMPTY }),

      isAuthenticated: () => {
        const { mobile_number, password } = get()
        return Boolean(mobile_number && password)
      },
    }),
    {
      name:    'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mobile_number: state.mobile_number,
        password:      state.password,
        username:      state.username,
        is_superuser:  state.is_superuser,
        isLoggedIn:    state.isLoggedIn,
        user_id:       state.user_id,           // ← ADDED here too
      }),
    }
  )
)

export default useAuthStore

export const getAuthState   = () => useAuthStore.getState()
export const getIsSuperUser = () => useAuthStore.getState().is_superuser
export const getIsLoggedIn  = () => useAuthStore.getState().isLoggedIn
