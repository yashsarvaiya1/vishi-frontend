// components/shared/AdminRoute.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/authStore'
import useUIStore from '@/stores/uiStore'
import LoadingSpinner from './LoadingSpinner'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router       = useRouter()
  const is_superuser = useAuthStore((s) => s.is_superuser)
  const hydrated     = useUIStore((s) => s.hydrated)

  useEffect(() => {
    if (hydrated && !is_superuser) {
      router.replace('/')
    }
  }, [hydrated, is_superuser, router])

  if (!hydrated) return <LoadingSpinner fullPage />
  if (!is_superuser) return null

  return <>{children}</>
}
