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
          <a href="#main-content" className="skip-link">Skip to content</a>
          <main id="main-content" tabIndex={-1} className="app-main flex-1 min-w-0 outline-none">
            <div className="mx-auto w-full max-w-6xl animate-fade-up">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </ProtectedRoute>
    </HydrationGuard>
  )
}
