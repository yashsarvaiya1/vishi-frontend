// hooks/useDashboard.ts

import { useQuery }         from '@tanstack/react-query'
import { useMemo }          from 'react'
import { dashboardService } from '@/services/dashboardService'
import useAuthStore         from '@/stores/authStore'
import type {
  AdminDashboard,
  MyVishiGroup,
  MyPaymentVishiGroup,
  UserHomeDerived,
} from '@/models/dashboard'


export const DASHBOARD_KEYS = {
  root:            ['dashboard']              as const,
  paymentsSummary: ['payments', 'summary']    as const,
  myVishis:        ['profile', 'my-vishis']   as const,
  myPayments:      ['profile', 'my-payments'] as const,
}


// M1 — Superuser only: stat cards + action alerts + upcoming week events
export function useAdminDashboard() {
  const isLoggedIn  = useAuthStore((s) => s.isLoggedIn)
  const isSuperuser = useAuthStore((s) => s.is_superuser)

  return useQuery({
    queryKey:  DASHBOARD_KEYS.root,
    queryFn:   () => dashboardService.getAdminDashboard().then((r) => r.data),
    enabled:   isLoggedIn && isSuperuser,
    staleTime: 60_000,
  })
}


// M3 — Superuser only: cross-vishi grouped dues overview (Collect Payments screen)
export function usePaymentsSummary() {
  const isLoggedIn  = useAuthStore((s) => s.isLoggedIn)
  const isSuperuser = useAuthStore((s) => s.is_superuser)

  return useQuery({
    queryKey:  DASHBOARD_KEYS.paymentsSummary,
    queryFn:   () => dashboardService.getPaymentsSummary().then((r) => r.data),
    enabled:   isLoggedIn && isSuperuser,
    staleTime: 30_000,
  })
}


// M5 — All users: own vishis with all slots grouped per vishi
// Used by: My Vishis screen + useUserHomeDerived
export function useMyVishis() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  return useQuery({
    queryKey:  DASHBOARD_KEYS.myVishis,
    queryFn:   () => dashboardService.getMyVishis().then((r) => r.data),
    enabled:   isLoggedIn,
    staleTime: 60_000,
  })
}


// M6 — All users: own payment history grouped by vishi
// Used by: My Payments screen
export function useMyPayments() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  return useQuery({
    queryKey:  DASHBOARD_KEYS.myPayments,
    queryFn:   () => dashboardService.getMyPayments().then((r) => r.data),
    enabled:   isLoggedIn,
    staleTime: 60_000,
  })
}


// User home screen stats are DERIVED from M5 data — no extra API call needed.
export function useUserHomeDerived(): {
  data:      UserHomeDerived | undefined
  isLoading: boolean
  isError:   boolean
} {
  const { data: myVishis, isLoading, isError } = useMyVishis()

  const derived = useMemo<UserHomeDerived | undefined>(() => {
    if (!myVishis) return undefined

    const active_vishis_count = myVishis.filter((v) => v.status === 'active').length

    let pendingCents = 0
    for (const group of myVishis) {
      const balance = parseFloat(group.total_balance)
      if (balance < 0) pendingCents += Math.abs(balance)
    }

    return {
      active_vishis_count,
      total_pending_balance: pendingCents.toFixed(2),
      my_vishis: myVishis,
    }
  }, [myVishis])

  return { data: derived, isLoading, isError }
}
