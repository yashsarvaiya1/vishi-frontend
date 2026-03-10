// components/common/profile/ProfilePage.tsx
'use client'

import { useState }                       from 'react'
import { useRouter }                      from 'next/navigation'
import { useGetMe, useClearMyPassword }   from '@/hooks/useAuth'
import { formatDate, getInitials }        from '@/lib/utils'
import { Button }                         from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator }                      from '@/components/ui/separator'
import { Avatar, AvatarFallback }         from '@/components/ui/avatar'
import { Badge }                          from '@/components/ui/badge'
import ConfirmDialog                      from '@/components/shared/ConfirmDialog'
import LoadingSpinner                     from '@/components/shared/LoadingSpinner'
import PageHeader                         from '@/components/shared/PageHeader'
import {
  LogOut, ShieldCheck, KeyRound,
  Phone, MapPin, Calendar, User, Pencil,
  Wallet, IndianRupee, ChevronRight,
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'

export default function ProfilePage() {
  const router        = useRouter()
  const clearAuth     = useAuthStore((s) => s.clearAuth)
  const is_superuser  = useAuthStore((s) => s.is_superuser)
  const clearMyPass   = useClearMyPassword()

  const [showLogout,    setShowLogout]    = useState(false)
  const [showResetPass, setShowResetPass] = useState(false)

  const { data: user, isLoading } = useGetMe()

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  if (isLoading) return <LoadingSpinner fullPage label="Loading profile..." />

  if (!user) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Could not load profile.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" />

      {/* Avatar + name card */}
      <Card className="rounded-xl">
        <CardContent className="pt-6 pb-5 px-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                {getInitials(user.username || user.mobile_number)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight truncate">
                {user.username || '—'}
              </p>
              <p className="text-sm text-muted-foreground">{user.mobile_number}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={
                    user.is_active
                      ? 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 text-xs'
                      : 'text-muted-foreground text-xs'
                  }
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {user.is_superuser && (
                  <Badge
                    variant="outline"
                    className="text-primary bg-primary/5 border-primary/20 text-xs flex items-center gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details card */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <InfoRow icon={Phone}    label="Mobile"       value={user.mobile_number} />
          <InfoRow icon={User}     label="Username"     value={user.username || '—'} />
          <InfoRow icon={MapPin}   label="Address"      value={user.address || '—'} />
          <InfoRow icon={Calendar} label="Member since" value={formatDate(user.date_joined)} />
          <InfoRow
            icon={Calendar}
            label="Last login"
            value={user.last_login ? formatDate(user.last_login) : 'Never'}
          />
        </CardContent>
      </Card>

      {/* Additional contacts */}
      {user.additional_contacts?.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
              Additional Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            {user.additional_contacts.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">({c.relation})</span>
                </div>
                <span className="text-muted-foreground">{c.number}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/*
       * Flow §8 + §2 — Admin "MY ACCOUNT" group.
       * Admin sees the same own-participation screens as regular users.
       * Quick links surfaced here so admin can reach them without the header dropdown.
       */}
      {is_superuser && (
        <Card className="rounded-xl">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
              My Account
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-1">
            <NavLink
              icon={Wallet}
              label="My Vishis"
              description="Your own participation slots"
              onClick={() => router.push('/common/my-vishis')}
            />
            <Separator />
            <NavLink
              icon={IndianRupee}
              label="My Payments"
              description="Your payment history grouped by vishi"
              onClick={() => router.push('/common/my-payments')}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="rounded-xl">
        <CardContent className="px-5 py-4 space-y-2.5">
          {/* Flow §8 — Reset My Password: clears own password, redirects to set-password */}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setShowResetPass(true)}
          >
            <KeyRound className="h-4 w-4" />
            Reset My Password
          </Button>
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowLogout(true)}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>

      {/* Logout confirm */}
      <ConfirmDialog
        open={showLogout}
        onOpenChange={setShowLogout}
        title="Logout?"
        description="You will be redirected to the login screen."
        confirmLabel="Logout"
        variant="destructive"
        onConfirm={handleLogout}
      />

      {/* Reset password confirm — clears password then logs out */}
      <ConfirmDialog
        open={showResetPass}
        onOpenChange={setShowResetPass}
        title="Reset Your Password?"
        description="Your password will be cleared. You'll need to set a new one on next login."
        confirmLabel="Reset Password"
        variant="destructive"
        loading={clearMyPass.isPending}
        onConfirm={() =>
          clearMyPass.mutate(undefined, {
            onSuccess: () => {
              setShowResetPass(false)
              clearAuth()
              router.replace('/login')
            },
          })
        }
      />
    </div>
  )
}

function InfoRow({
  icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="font-medium flex-1 break-all">{value}</span>
    </div>
  )
}

function NavLink({
  icon: Icon, label, description, onClick,
}: {
  icon: React.ElementType
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2.5 text-left hover:opacity-75 transition-opacity"
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  )
}
