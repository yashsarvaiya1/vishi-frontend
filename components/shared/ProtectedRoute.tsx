// components/shared/ProtectedRoute.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/authStore'
import useUIStore from '@/stores/uiStore'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router     = useRouter()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const hydrated   = useUIStore((s) => s.hydrated)

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.replace('/login')
    }
  }, [hydrated, isLoggedIn, router])

  if (!hydrated) return null
  if (!isLoggedIn) return null

  return <>{children}</>
}
