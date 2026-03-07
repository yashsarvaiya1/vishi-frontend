// components/shared/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Users, Wallet, User,
  LayoutDashboard, IndianRupee, ListChecks, LogOut,
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useUIStore from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const COMMON_LINKS = [
  { href: '/',                   label: 'Home',        icon: Home },
  { href: '/common/my-vishis',   label: 'My Vishis',   icon: Wallet },
  { href: '/common/my-payments', label: 'My Payments', icon: IndianRupee },
  { href: '/common/profile',     label: 'Profile',     icon: User },
]

const ADMIN_LINKS = [
  { href: '/admin/vishis',  label: 'Manage Vishis',    icon: LayoutDashboard },
  { href: '/admin/collect', label: 'Collect Payments', icon: ListChecks },
  { href: '/admin/users',   label: 'Manage Users',     icon: Users },
]

// FIXED: exact match for '/', prefix match for everything else
function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export default function Sidebar() {
  const pathname     = usePathname()
  const router       = useRouter()
  const sidebarOpen  = useUIStore((s) => s.sidebarOpen)
  const setSidebar   = useUIStore((s) => s.setSidebarOpen)
  const is_superuser = useAuthStore((s) => s.is_superuser)
  const clearAuth    = useAuthStore((s) => s.clearAuth)

  if (!sidebarOpen) return null

  const close = () => setSidebar(false)

  const handleLogout = () => {
    close()
    clearAuth()
    router.replace('/login')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <aside className="fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 bg-background border-r shadow-xl flex flex-col">
        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {is_superuser && (
            <>
              <SectionLabel>Admin Panel</SectionLabel>
              {ADMIN_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  {...link}
                  active={isActive(link.href, pathname)}
                  onClick={close}
                />
              ))}
              <div className="my-3 border-t" />
            </>
          )}

          <SectionLabel>Common</SectionLabel>
          {COMMON_LINKS.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              active={isActive(link.href, pathname)}
              onClick={close}
            />
          ))}
        </nav>

        {/* Logout pinned at bottom */}
        <div className="px-3 py-3 border-t shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground/60 px-3 pb-1.5 pt-2 uppercase tracking-widest">
      {children}
    </p>
  )
}

function NavLink({
  href, label, icon: Icon, active, onClick,
}: {
  href: string; label: string; icon: React.ElementType
  active: boolean; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-foreground/70 hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}
