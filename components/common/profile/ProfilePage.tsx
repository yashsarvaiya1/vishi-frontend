// components/common/profile/ProfilePage.tsx
'use client'

import { useState }                     from 'react'
import { useRouter }                    from 'next/navigation'
import { useGetMe, useClearMyPassword } from '@/hooks/useAuth'
import { formatDate, getInitials }      from '@/lib/utils'
import { Button }                       from '@/components/ui/button'
import { Card, CardContent }            from '@/components/ui/card'
import { Separator }                    from '@/components/ui/separator'
import { Avatar, AvatarFallback }       from '@/components/ui/avatar'
import { Badge }                        from '@/components/ui/badge'
import ConfirmDialog                    from '@/components/shared/ConfirmDialog'
import LoadingSpinner                   from '@/components/shared/LoadingSpinner'
import PageHeader                       from '@/components/shared/PageHeader'
import {
  LogOut, ShieldCheck, KeyRound,
  Phone, MapPin, Calendar, User,
  Wallet, IndianRupee, ChevronRight,
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'

export default function ProfilePage() {
  const router       = useRouter()
  const clearAuth    = useAuthStore((s) => s.clearAuth)
  const is_superuser = useAuthStore((s) => s.is_superuser)
  const clearMyPass  = useClearMyPassword()

  const [showLogout,    setShowLogout]    = useState(false)
  const [showResetPass, setShowResetPass] = useState(false)

  const { data: user, isLoading } = useGetMe()

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  if (isLoading) return <LoadingSpinner fullPage label="Loading profile..." />
  if (!user) return (
    <p className="text-center text-muted-foreground py-16">Could not load profile.</p>
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Profile" />

      {/* Avatar hero card */}
      <Card className="rounded-2xl overflow-hidden">
        <div className="h-16 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="px-5 pb-5 -mt-8">
          <div className="flex items-end gap-4">
            <Avatar className="h-16 w-16 shrink-0 ring-4 ring-background shadow-md">
              <AvatarFallback className="text-xl bg-primary/15 text-primary font-black">
                {getInitials(user.username || user.mobile_number)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <p className="font-bold text-lg leading-tight truncate">
                {user.username || '—'}
              </p>
              <p className="text-sm text-muted-foreground">{user.mobile_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge
              variant="outline"
              className={
                user.is_active
                  ? 'border-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'border-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500'
              }
            >
              {user.is_active ? '● Active' : 'Inactive'}
            </Badge>
            {user.is_superuser && (
              <Badge
                variant="outline"
                className="border-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1"
              >
                <ShieldCheck className="h-3 w-3" /> Admin
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="rounded-2xl">
        <CardContent className="px-5 py-4 space-y-3.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Details
          </p>
          <InfoRow icon={Phone}    label="Mobile"       value={user.mobile_number} />
          <InfoRow icon={User}     label="Username"     value={user.username || '—'} />
          <InfoRow icon={MapPin}   label="Address"      value={user.address || '—'} />
          <InfoRow icon={Calendar} label="Joined"       value={formatDate(user.date_joined)} />
          <InfoRow
            icon={Calendar}
            label="Last login"
            value={user.last_login ? formatDate(user.last_login) : 'Never'}
          />
        </CardContent>
      </Card>

      {/* Additional contacts */}
      {user.additional_contacts?.length > 0 && (
        <Card className="rounded-2xl">
          <CardContent className="px-5 py-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Additional Contacts
            </p>
            {user.additional_contacts.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">({c.relation})</span>
                </div>
                <span className="text-muted-foreground text-sm">{c.number}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Admin — My Account quick links */}
      {is_superuser && (
        <Card className="rounded-2xl">
          <CardContent className="px-5 py-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              My Account
            </p>
            <NavLink
              icon={Wallet}
              label="My Vishis"
              description="Your participation slots"
              onClick={() => router.push('/common/my-vishis')}
            />
            <Separator />
            <NavLink
              icon={IndianRupee}
              label="My Payments"
              description="Payment history by vishi"
              onClick={() => router.push('/common/my-payments')}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="rounded-2xl">
        <CardContent className="px-5 py-4 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2.5 h-10 rounded-xl"
            onClick={() => setShowResetPass(true)}
          >
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            Reset My Password
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/8"
            onClick={() => setShowLogout(true)}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showLogout}
        onOpenChange={setShowLogout}
        title="Logout?"
        description="You will be redirected to the login screen."
        confirmLabel="Logout"
        variant="destructive"
        onConfirm={handleLogout}
      />

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

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: string
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-muted-foreground w-20 shrink-0 text-xs mt-0.5">{label}</span>
      <span className="font-medium flex-1 break-all text-sm">{value}</span>
    </div>
  )
}

function NavLink({ icon: Icon, label, description, onClick }: {
  icon: React.ElementType; label: string; description: string; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 text-left hover:opacity-75 active:opacity-60 transition-opacity"
    >
      <div className="h-8 w-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  )
}
