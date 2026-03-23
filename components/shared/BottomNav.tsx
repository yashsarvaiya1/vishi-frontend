// components/shared/BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Wallet, IndianRupee, User,
  LayoutDashboard, ListChecks, Users,
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/70"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-16 items-stretch max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-colors duration-150',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Active indicator pill */}
              {active && (
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-primary" />
              )}
              <Icon className={cn(
                'h-5 w-5 shrink-0 transition-all duration-150',
                active ? 'scale-110' : 'scale-100'
              )} />
              <span className={cn(
                'text-[10px] leading-none',
                active ? 'font-bold' : 'font-medium'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
