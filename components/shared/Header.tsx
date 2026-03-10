// components/shared/Header.tsx
'use client'

import Link          from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User, ShieldCheck, Wallet, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge }       from '@/components/ui/badge'
import useAuthStore    from '@/stores/authStore'
import { getInitials } from '@/lib/utils'

export default function Header() {
  const router = useRouter()
  const { username, mobile_number, is_superuser, clearAuth } = useAuthStore()

  const displayName = username || mobile_number || ''

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">

      {/* Logo */}
      <Link
        href="/"
        className="font-bold text-xl tracking-tight hover:opacity-75 transition-opacity"
      >
        Vishi
      </Link>

      {/* Avatar with dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full focus-visible:ring-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            {/* Admin indicator dot */}
            {is_superuser && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                <ShieldCheck className="h-2 w-2 text-primary-foreground" />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal py-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-sm truncate">{username || 'User'}</span>
              <span className="text-xs text-muted-foreground">{mobile_number}</span>
              {is_superuser && (
                <Badge
                  variant="secondary"
                  className="w-fit mt-1 text-[10px] px-1.5 py-0 h-4 gap-1"
                >
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Administrator
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/*
           * Flow §2 — Admin's "MY ACCOUNT" group:
           * Admin sees the same own-participation screens as regular users.
           * These are separate from the admin panel navigation.
           */}
          {is_superuser && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/common/my-vishis" className="cursor-pointer">
                    <Wallet className="h-4 w-4 mr-2" />
                    My Vishis
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/common/my-payments" className="cursor-pointer">
                    <IndianRupee className="h-4 w-4 mr-2" />
                    My Payments
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}

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
