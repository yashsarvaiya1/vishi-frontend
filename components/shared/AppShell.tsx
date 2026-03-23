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
           * pb-bottom-nav = 5rem + safe-area-inset-bottom (from globals.css utility)
           * ensures content is never hidden behind the bottom nav on notched phones.
           * max-w-lg keeps content readable on tablets without becoming too wide.
           */}
          <main className="flex-1 overflow-y-auto pt-5 pb-bottom-nav px-4">
            <div className="max-w-lg mx-auto w-full animate-fade-up">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </ProtectedRoute>
    </HydrationGuard>
  )
}
