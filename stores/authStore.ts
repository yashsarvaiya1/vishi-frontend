// stores/authStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'


interface AuthCredentials {
  mobile_number: string
  password:      string
  username:      string | null
  is_superuser:  boolean
}

interface AuthState {
  mobile_number: string
  password:      string
  username:      string | null
  is_superuser:  boolean
  isLoggedIn:    boolean

  setAuth:        (data: AuthCredentials) => void
  updateUsername: (username: string | null) => void  // ← ADDED: sync after profile edit
  clearAuth:      () => void
  isAuthenticated: () => boolean                     // ← ADDED: safe computed check
}

const EMPTY: Omit<AuthState, 'setAuth' | 'updateUsername' | 'clearAuth' | 'isAuthenticated'> = {
  mobile_number: '',
  password:      '',
  username:      null,
  is_superuser:  false,
  isLoggedIn:    false,
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
        }),

      // ← ADDED: called after PATCH /api/profile/me/update/ to keep store in sync
      updateUsername: (username) => set({ username }),

      clearAuth: () => set({ ...EMPTY }),

      // ← ADDED: used in hooks to gate queries
      isAuthenticated: () => {
        const { mobile_number, password } = get()
        return Boolean(mobile_number && password)
      },
    }),
    {
      name:    'auth-storage',   // must match lib/axios.ts localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mobile_number: state.mobile_number,
        password:      state.password,
        username:      state.username,
        is_superuser:  state.is_superuser,
        isLoggedIn:    state.isLoggedIn,
      }),
    }
  )
)

export default useAuthStore

// Named selectors for use outside React (e.g. in services or axios interceptor)
export const getAuthState   = () => useAuthStore.getState()
export const getIsSuperUser = () => useAuthStore.getState().is_superuser
export const getIsLoggedIn  = () => useAuthStore.getState().isLoggedIn
