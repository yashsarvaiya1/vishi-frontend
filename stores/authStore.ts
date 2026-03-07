// stores/authStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  mobile_number: string | null
  password:      string | null
  username:      string | null
  is_superuser:  boolean
  isLoggedIn:    boolean
  setAuth: (data: {
    mobile_number: string
    password:      string
    username:      string | null
    is_superuser:  boolean
  }) => void
  clearAuth: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      mobile_number: null,
      password:      null,
      username:      null,
      is_superuser:  false,
      isLoggedIn:    false,

      setAuth: (data) =>
        set({
          mobile_number: data.mobile_number,
          password:      data.password,
          username:      data.username,
          is_superuser:  data.is_superuser,
          isLoggedIn:    true,
        }),

      clearAuth: () =>
        set({
          mobile_number: null,
          password:      null,
          username:      null,
          is_superuser:  false,
          isLoggedIn:    false,
        }),
    }),
    {
      name:    'auth-storage',
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
