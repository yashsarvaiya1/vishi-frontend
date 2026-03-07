// components/shared/AppShell.tsx
'use client'

import HydrationGuard from './HydrationGuard'
import ProtectedRoute from './ProtectedRoute'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGuard>
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <Sidebar />
          {/* Sidebar is fixed/overlay — no ml-64 needed */}
          <main className="flex-1 overflow-y-auto pb-10 px-4 pt-5 md:px-6">
            <div className="max-w-5xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </HydrationGuard>
  )
}
