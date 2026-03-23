// components/shared/Providers.tsx
'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry:   1,
            // ← FIXED: was 30s with refetchOnWindowFocus: false — caused stale data
            // Now: 60s stale time but refetch on window focus so switching tabs
            // or returning to the app always shows fresh data
            staleTime:            1000 * 60,
            refetchOnWindowFocus: true,
            // ← ADDED: refetch when network reconnects (phone switching wifi/4G)
            refetchOnReconnect:   true,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        // ← ADDED: better mobile toast sizing
        toastOptions={{
          classNames: {
            toast: 'text-sm font-medium',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
