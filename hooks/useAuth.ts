// hooks/useAuth.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import useAuthStore from '@/stores/authStore'
import type { CheckNumberRequest, LoginRequest, SetPasswordRequest } from '@/models/auth'
import type { UpdateProfilePayload } from '@/models/user'  // ← FIXED: added `type`


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
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to clear password.'),
  })
}


export function useGetMe() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return useQuery({
    queryKey:  AUTH_KEYS.me,
    queryFn:   () => authService.getMe().then((r) => r.data),
    enabled:   isLoggedIn,
    staleTime: 1000 * 60 * 5,
  })
}


export function useUpdateMe() {
  const qc             = useQueryClient()
  // ← FIXED: use updateUsername only — avoids having to re-supply password + mobile
  const updateUsername = useAuthStore((s) => s.updateUsername)

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => authService.updateMe(data),
    onSuccess: (res) => {
      // Update React Query cache
      qc.setQueryData(AUTH_KEYS.me, res.data)
      // Sync store username so the nav header reflects immediately
      updateUsername(res.data.username ?? null)
      toast.success('Profile updated.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to update profile.'),
  })
}
