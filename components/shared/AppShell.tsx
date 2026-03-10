// components/shared/AppShell.tsx
'use client'

import HydrationGuard from './HydrationGuard'
import ProtectedRoute from './ProtectedRoute'
import Header         from './Header'
import BottomNav      from './BottomNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGuard>
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          {/*
           * pb-20 = 80px clearance for the 64px bottom nav + safe area buffer.
           * max-w-lg keeps content readable on tablets too.
           */}
          <main className="flex-1 overflow-y-auto pt-5 pb-20 px-4">
            <div className="max-w-lg mx-auto w-full">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </ProtectedRoute>
    </HydrationGuard>
  )
}
