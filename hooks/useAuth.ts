// hooks/useAuth.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import useAuthStore from '@/stores/authStore'
import type { CheckNumberRequest, LoginRequest, SetPasswordRequest } from '@/models/auth'
import { UpdateProfilePayload } from '@/models/user'


export const AUTH_KEYS = {
  me: ['me'] as const,
}


export function useCheckNumber() {
  const router = useRouter()
  return useMutation({
    mutationFn: (data: CheckNumberRequest) => authService.checkNumber(data),
    onSuccess: (res, variables) => {
      const { password_set, username } = res.data
      sessionStorage.setItem('pending_mobile',   variables.mobile_number)
      sessionStorage.setItem('pending_username', username ?? '')
      if (!password_set) {
        router.push('/set-password')
      } else {
        router.push('/password')
      }
    },
    onError: () => toast.error('No user found. Contact admin.'),
  })
}


export function useSetPassword() {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: SetPasswordRequest) => authService.setPassword(data),
    onSuccess: (res, variables) => {
      setAuth({
        mobile_number: variables.mobile_number,
        password:      variables.password,
        username:      res.data.username ?? null,
        is_superuser:  res.data.is_superuser ?? false,
      })
      sessionStorage.removeItem('pending_mobile')
      sessionStorage.removeItem('pending_username')
      toast.success('Password set. Welcome!')
      router.push('/')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to set password.'),
  })
}


export function useLogin() {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res, variables) => {
      const data = res.data

      // password not yet set — redirect to create password screen
      if ('password_set' in data && data.password_set === false) {
        sessionStorage.setItem('pending_mobile', variables.mobile_number)
        router.push('/set-password')
        return
      }

      // normal login
      if ('is_superuser' in data) {
        setAuth({
          mobile_number: variables.mobile_number,
          password:      variables.password,
          username:      data.username ?? null,
          is_superuser:  data.is_superuser ?? false,
        })
        sessionStorage.removeItem('pending_mobile')
        sessionStorage.removeItem('pending_username')
        toast.success(`Welcome back${data.username ? ', ' + data.username : ''}!`)
        router.push('/')
      }
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Login failed.'),
  })
}


export function useClearMyPassword() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router    = useRouter()
  return useMutation({
    mutationFn: () => authService.clearMyPassword(),
    onSuccess: () => {
      clearAuth()
      toast.success('Password cleared. Please set a new one.')
      router.push('/login')
    },
    // FIXED: was missing onError
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to clear password.'),
  })
}


// NEW: fetch logged-in user's own profile
export function useGetMe() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn:  () => authService.getMe().then((r) => r.data),
    enabled:  isLoggedIn,
    staleTime: 1000 * 60 * 5,  // 5 min — profile doesn't change often
  })
}


// NEW: update own profile (superuser only on backend — 403 for regular users)
export function useUpdateMe() {
  const qc      = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)
  const store   = useAuthStore()

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>   // FIXED: was inline type with unknown[]
      authService.updateMe(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: AUTH_KEYS.me })
      if (res.data.username !== undefined && store.mobile_number && store.password) {
        setAuth({
          mobile_number: store.mobile_number,
          password:      store.password,
          username:      res.data.username,
          is_superuser:  store.is_superuser,
        })
      }
      toast.success('Profile updated.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to update profile.'),
  })
}
