// components/shared/Header.tsx
'use client'

import Link          from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User, ShieldCheck, Wallet, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuGroup,
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className="max-w-lg mx-auto flex h-14 items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-primary-foreground tracking-tighter">V</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Vishi</span>
        </Link>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full focus-visible:ring-0 hover:bg-muted"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              {is_superuser && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                  <ShieldCheck className="h-2 w-2 text-primary-foreground" />
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg">
            <DropdownMenuLabel className="font-normal py-3 px-3">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{username || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{mobile_number}</p>
                </div>
              </div>
              {is_superuser && (
                <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 py-0 h-4 gap-1 w-fit">
                  <ShieldCheck className="h-2.5 w-2.5" /> Administrator
                </Badge>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {is_superuser && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/common/my-vishis" className="cursor-pointer">
                      <Wallet className="h-4 w-4 mr-2 text-muted-foreground" /> My Vishis
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/common/my-payments" className="cursor-pointer">
                      <IndianRupee className="h-4 w-4 mr-2 text-muted-foreground" /> My Payments
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem asChild>
              <Link href="/common/profile" className="cursor-pointer">
                <User className="h-4 w-4 mr-2 text-muted-foreground" /> Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
