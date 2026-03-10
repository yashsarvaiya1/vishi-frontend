// components/home/HomePage.tsx
'use client'

import { useMemo }           from 'react'
import useAuthStore          from '@/stores/authStore'
import { useAdminDashboard, useMyVishis } from '@/hooks/useDashboard'
import AdminHome             from './AdminHome'
import UserHome              from './UserHome'
import LoadingSpinner        from '@/components/shared/LoadingSpinner'
import EmptyState            from '@/components/shared/EmptyState'
import { AlertCircle }       from 'lucide-react'
import type { UserHomeDerived } from '@/models/dashboard'
import type { MyVishiGroup }    from '@/models/dashboard'


export default function HomePage() {
  const is_superuser = useAuthStore((s) => s.is_superuser)

  // Admin: use dashboard endpoint
  const adminQuery = useAdminDashboard()

  // User: derive home data from GET /api/profile/me/vishis/ — no UserDashboard endpoint exists
  const { data: myVishis, isLoading: vishisLoading, isError: vishisError } = useMyVishis()

  // Derive UserHomeDerived on the frontend from MyVishiGroup[] (per flow §3 + model comment)
  const userHomeDerived = useMemo<UserHomeDerived | null>(() => {
    if (!myVishis) return null
    const active_vishis_count = myVishis.filter((g) => g.status === 'active').length
    const total_pending_balance = myVishis
      .reduce((sum, g) => {
        const bal = parseFloat(g.total_balance)
        return bal < 0 ? sum + bal : sum
      }, 0)
      .toFixed(2)
    return { active_vishis_count, total_pending_balance, my_vishis: myVishis }
  }, [myVishis])

  if (is_superuser) {
    if (adminQuery.isLoading) return <LoadingSpinner fullPage />
    if (adminQuery.isError || !adminQuery.data) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Failed to load dashboard"
          description="Pull down to refresh or try again later."
        />
      )
    }
    return <AdminHome data={adminQuery.data} />
  }

  // Regular user
  if (vishisLoading) return <LoadingSpinner fullPage />
  if (vishisError || !userHomeDerived) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard"
        description="Pull down to refresh or try again later."
      />
    )
  }
  return <UserHome data={userHomeDerived} />
}
