// components/shared/Header.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, LogOut, User, ChevronDown, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import useUIStore from '@/stores/uiStore'
import useAuthStore from '@/stores/authStore'
import { getInitials } from '@/lib/utils'

export default function Header() {
  const router        = useRouter()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const { username, mobile_number, is_superuser, clearAuth } = useAuthStore()

  const displayName = username || mobile_number || ''

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center px-4 gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Link
        href="/"
        className="font-bold text-lg tracking-tight flex-1 hover:opacity-75 transition-opacity"
      >
        Vishi
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 focus-visible:ring-0">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium max-w-25 truncate">
              {username || mobile_number}
            </span>
            {is_superuser && (
              <Badge
                variant="secondary"
                className="hidden sm:flex items-center gap-1 text-xs px-1.5 py-0 h-5"
              >
                <ShieldCheck className="h-3 w-3" />
                Admin
              </Badge>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal py-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-sm truncate">{username || 'User'}</span>
              <span className="text-xs text-muted-foreground">{mobile_number}</span>
              {is_superuser && (
                <span className="text-xs text-primary font-medium mt-0.5">Administrator</span>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/common/profile" className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
