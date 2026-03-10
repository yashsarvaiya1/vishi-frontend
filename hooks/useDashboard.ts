import { useQuery }         from '@tanstack/react-query'
import { useMemo }          from 'react'
import { dashboardService } from '@/services/dashboardService'
import useAuthStore         from '@/stores/authStore'
import type {
  AdminDashboard,
  MyVishiGroup,
  MyPaymentVishiGroup,  // ✅ correct type name
  UserHomeDerived,
} from '@/models/dashboard'


export const DASHBOARD_KEYS = {
  root:            ['dashboard']              as const,
  paymentsSummary: ['payments', 'summary']    as const,
  myVishis:        ['profile', 'my-vishis']   as const,
  myPayments:      ['profile', 'my-payments'] as const,
}


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


export function useMyVishis() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return useQuery({
    queryKey:  DASHBOARD_KEYS.myVishis,
    queryFn:   () => dashboardService.getMyVishis().then((r) => r.data),
    enabled:   isLoggedIn,
    staleTime: 60_000,
  })
}


export function useMyPayments() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return useQuery({
    queryKey:  DASHBOARD_KEYS.myPayments,
    queryFn:   () => dashboardService.getMyPayments().then((r) => r.data),
    enabled:   isLoggedIn,
    staleTime: 60_000,
  })
}


// Derived from M5 — no extra API call
export function useUserHomeDerived(): {
  data:      UserHomeDerived | undefined
  isLoading: boolean
  isError:   boolean
} {
  const { data: myVishis, isLoading, isError } = useMyVishis()

  const derived = useMemo<UserHomeDerived | undefined>(() => {
    // FIXED: myVishis is a plain array from backend
    if (!Array.isArray(myVishis)) return undefined

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
