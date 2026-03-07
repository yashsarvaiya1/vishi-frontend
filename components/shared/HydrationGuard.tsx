// components/shared/HydrationGuard.tsx
'use client'

import { useEffect } from 'react'
import useUIStore from '@/stores/uiStore'

export default function HydrationGuard({ children }: { children: React.ReactNode }) {
  const setHydrated = useUIStore((s) => s.setHydrated)
  const hydrated    = useUIStore((s) => s.hydrated)

  useEffect(() => {
    setHydrated(true)
  }, [setHydrated])

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
