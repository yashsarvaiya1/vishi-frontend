// components/shared/BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Wallet, IndianRupee, User,
  LayoutDashboard, ListChecks, Users, ArrowUpRight,
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { cn } from '@/lib/utils'

const USER_TABS = [
  { href: '/',                   label: 'Home',      icon: Home        },
  { href: '/common/my-vishis',   label: 'My Vishis', icon: Wallet      },
  { href: '/common/my-payments', label: 'Payments',  icon: IndianRupee },
  { href: '/common/profile',     label: 'Profile',   icon: User        },
]

const ADMIN_TABS = [
  { href: '/',               label: 'Dashboard', icon: Home            },
  { href: '/admin/vishis',   label: 'Vishis',    icon: LayoutDashboard },
  { href: '/admin/collect',  label: 'Collect',   icon: ListChecks      },
  { href: '/admin/users',    label: 'Users',     icon: Users           },
  { href: '/common/profile', label: 'Me',        icon: User            },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export default function BottomNav() {
  const pathname     = usePathname()
  const is_superuser = useAuthStore((s) => s.is_superuser)
  const tabs         = is_superuser ? ADMIN_TABS : USER_TABS

  return (
    <nav aria-label="Main navigation" className="app-navigation">
      <Link href="/" className="hidden lg:flex items-center gap-3 px-3 mb-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-sm">V</span>
        <span className="text-xl font-bold tracking-tight">Vishi<span className="block text-[11px] font-medium tracking-normal text-muted-foreground">Your money, together.</span></span>
      </Link>
      <p className="hidden lg:block px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {is_superuser ? 'Workspace' : 'Your space'}
      </p>
      <div className="flex lg:flex-col gap-1 lg:gap-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname)
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined}
              className={cn(
                'nav-item group relative flex flex-1 lg:flex-none flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 rounded-xl px-1 py-2 lg:px-3 lg:py-3 text-muted-foreground transition-colors',
                active ? 'bg-primary/8 text-primary font-semibold' : 'hover:bg-muted hover:text-foreground'
              )}>
              <Icon className={cn('h-5 w-5 shrink-0', active && 'text-primary')} />
              <span className="text-[10px] sm:text-[11px] lg:text-sm font-medium leading-tight">{label}</span>
              {active && <span className="absolute bottom-0.5 lg:bottom-auto lg:right-3 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </div>
      {is_superuser && (
        <div className="hidden lg:block mt-8 pt-5 border-t">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Personal</p>
          {[
            { href: '/common/my-vishis', label: 'My Vishis', icon: Wallet },
            { href: '/common/my-payments', label: 'My Payments', icon: IndianRupee },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={isActive(href, pathname) ? 'page' : undefined}
              className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors',
                isActive(href, pathname) ? 'bg-primary/8 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <Icon className="h-4 w-4" />{label}<ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-50" />
            </Link>
          ))}
        </div>
      )}
      <div className="hidden lg:block mt-auto rounded-2xl bg-primary/5 p-4">
        <p className="text-xs font-semibold text-primary">A little clarity. Every cycle.</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">Your groups, payments and progress, all in one place.</p>
      </div>
    </nav>
  )
}
