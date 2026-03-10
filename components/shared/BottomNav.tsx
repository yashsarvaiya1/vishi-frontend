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
  { href: '/',                   label: 'Home',      icon: Home            },
  { href: '/common/my-vishis',   label: 'My Vishis', icon: Wallet          },
  { href: '/common/my-payments', label: 'Payments',  icon: IndianRupee     },
  { href: '/common/profile',     label: 'Profile',   icon: User            },
]

// Flow §2 — Admin has: Dashboard · Vishis · Collect · Users · Me
// "Me" resolves to /common/profile which surfaces My Vishis + My Payments
// links for admin's own participation view (flow §2 "MY ACCOUNT" group).
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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t"
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
                'flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-150',
                  active && 'scale-110'
                )}
              />
              <span className={cn(
                'text-[10px] leading-none',
                active ? 'font-semibold' : 'font-medium'
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
