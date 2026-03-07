// hooks/useDashboard.ts

import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import useAuthStore from '@/stores/authStore'
import type { AdminDashboard, UserDashboard } from '@/models/dashboard'


export const DASHBOARD_KEYS = {
  root:            ['dashboard'] as const,
  paymentsSummary: ['payments', 'summary'] as const,
  myVishis:        ['profile', 'my-vishis'] as const,
  myPayments:      ['profile', 'my-payments'] as const,
}


// M1 — admin dashboard: stat cards + action alerts + upcoming week events
export function useAdminDashboard() {
  return useQuery({
    queryKey:  DASHBOARD_KEYS.root,
    queryFn:   () => dashboardService.get().then((r) => r.data as AdminDashboard),
    staleTime: 60 * 1000,
  })
}

// M1 — user dashboard: active vishis count + pending balance + my vishis summary
export function useUserDashboard() {
  return useQuery({
    queryKey:  DASHBOARD_KEYS.root,
    queryFn:   () => dashboardService.get().then((r) => r.data as UserDashboard),
    staleTime: 60 * 1000,
  })
}


// M3 — admin collect screen: cross-vishi grouped dues overview
export function usePaymentsSummary() {
  const isSuperuser = useAuthStore((s) => s.is_superuser)
  return useQuery({
    queryKey:  DASHBOARD_KEYS.paymentsSummary,
    queryFn:   () => dashboardService.getPaymentsSummary().then((r) => r.data),
    enabled:   isSuperuser,
    staleTime: 30 * 1000,
  })
}


// M5 — user's own vishis screen: grouped slots per vishi
export function useMyVishis() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return useQuery({
    queryKey:  DASHBOARD_KEYS.myVishis,
    queryFn:   () => dashboardService.getMyVishis().then((r) => r.data),
    enabled:   isLoggedIn,
    staleTime: 60 * 1000,
  })
}


// M6 — user's own payments screen: history grouped by vishi
export function useMyPayments() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return useQuery({
    queryKey:  DASHBOARD_KEYS.myPayments,
    queryFn:   () => dashboardService.getMyPayments().then((r) => r.data),
    enabled:   isLoggedIn,
    staleTime: 60 * 1000,
  })
}
