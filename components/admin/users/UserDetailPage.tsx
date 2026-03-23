// components/admin/users/UserDetailPage.tsx
'use client'

import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import {
  useUser, useUpdateUser, useDeactivateUser,
  useActivateUser, useClearUserPassword,
  useUserParticipations,
} from '@/hooks/useUsers'
import useAuthStore          from '@/stores/authStore'
import { Button }            from '@/components/ui/button'
import { Input }             from '@/components/ui/input'
import { Label }             from '@/components/ui/label'
import { Badge }             from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator }         from '@/components/ui/separator'
import { Skeleton }          from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Loader2, Pencil, Check, X,
  ShieldCheck, Phone, MapPin, Calendar, Plus, KeyRound,
  ChevronRight, UserCheck, UserX,
} from 'lucide-react'
import AdminRoute     from '@/components/shared/AdminRoute'
import PageHeader     from '@/components/shared/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ConfirmDialog  from '@/components/shared/ConfirmDialog'
import { LedgerStatusBadge, ParticipantStatusBadge } from '@/components/shared/StatusBadge'
import { getInitials, formatDate } from '@/lib/utils'
import type { AdditionalContact }     from '@/models/user'
import type { UserParticipationSlot } from '@/models/dashboard'


export default function UserDetailPage({ id }: { id: number }) {
  const router   = useRouter()
  const myMobile = useAuthStore((s) => s.mobile_number)

  const { data: user, isLoading } = useUser(id)
  const update     = useUpdateUser(id)
  const deactivate = useDeactivateUser(id)
  const activate   = useActivateUser(id)
  const clearPass  = useClearUserPassword(id)

  const { data: participationSlots, isLoading: loadingParticipations } = useUserParticipations(id) as {
    data: UserParticipationSlot[] | undefined; isLoading: boolean
  }
  const slots: UserParticipationSlot[] = participationSlots ?? []

  const [editing,   setEditing]   = useState(false)
  const [username,  setUsername]  = useState('')
  const [address,   setAddress]   = useState('')
  const [contacts,  setContacts]  = useState<AdditionalContact[]>([])
  const [cName,     setCName]     = useState('')
  const [cNumber,   setCNumber]   = useState('')
  const [cRelation, setCRelation] = useState('')

  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [confirmActivate,   setConfirmActivate]   = useState(false)
  const [confirmClearPass,  setConfirmClearPass]  = useState(false)

  const isSelf           = user?.mobile_number === myMobile
  const canEdit          = user && (!user.is_superuser || isSelf)
  const canAdminActions  = user && !user.is_superuser && !isSelf
  const canClearPassword = user && !user.is_superuser

  const startEdit = () => {
    setUsername(user?.username ?? '')
    setAddress(user?.address ?? '')
    setContacts((user?.additional_contacts ?? []).map((c) => ({ ...c })))
    setCName(''); setCNumber(''); setCRelation('')
    setEditing(true)
  }

  const cancelEdit = () => { setEditing(false); setCName(''); setCNumber(''); setCRelation('') }

  const addContact = () => {
    if (!cName.trim() || !cNumber.trim()) return
    setContacts((prev) => [...prev, { name: cName.trim(), number: cNumber.trim(), relation: cRelation.trim() }])
    setCName(''); setCNumber(''); setCRelation('')
  }

  const saveEdit = () => {
    update.mutate(
      { username: username.trim(), address: address.trim(), additional_contacts: contacts },
      { onSuccess: () => setEditing(false) }
    )
  }

  if (isLoading) return <AdminRoute><LoadingSpinner fullPage label="Loading user..." /></AdminRoute>
  if (!user)     return <AdminRoute><p className="text-center text-muted-foreground py-12">User not found.</p></AdminRoute>

  return (
    <AdminRoute>
      <div className="space-y-4">
        <PageHeader back title="User Detail" />

        {/* Profile hero card */}
        <Card className="rounded-2xl overflow-hidden">
          <div className="h-14 bg-linear-to-br from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="px-5 pb-5 -mt-7">
            <div className="flex items-end gap-3 mb-3">
              <Avatar className="h-14 w-14 shrink-0 ring-4 ring-background shadow-md">
                <AvatarFallback className="text-lg bg-primary/15 text-primary font-black">
                  {getInitials(user.username || user.mobile_number)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pb-0.5 flex-1">
                <p className="font-black text-lg leading-tight truncate">{user.username || '—'}</p>
                <p className="text-sm text-muted-foreground">{user.mobile_number}</p>
              </div>
              {canEdit && !editing && (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0 mb-0.5" onClick={startEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge variant="outline" className={
                user.is_active
                  ? 'border-0 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'border-0 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-500'
              }>
                {user.is_active ? '● Active' : 'Inactive'}
              </Badge>
              {user.is_superuser && (
                <Badge variant="outline" className="border-0 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </Badge>
              )}
              {isSelf && (
                <Badge variant="outline" className="border-0 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-muted text-muted-foreground">
                  You
                </Badge>
              )}
              {user.password_set === false && (
                <Badge variant="outline" className="border-0 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> No password
                </Badge>
              )}
            </div>

            {/* Edit mode */}
            {editing ? (
              <div className="space-y-3">
                <Separator />
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus className="rounded-xl h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl h-10" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Additional Contacts</Label>
                  {contacts.length > 0 && (
                    <div className="space-y-1.5">
                      {contacts.map((c, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted rounded-xl px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.number}{c.relation && ` · ${c.relation}`}</p>
                          </div>
                          <button type="button" onClick={() => setContacts((prev) => prev.filter((_, idx) => idx !== i))}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-xl border p-3 space-y-2 bg-muted/30">
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Name *" value={cName} onChange={(e) => setCName(e.target.value)} className="text-sm h-9 rounded-xl" />
                      <Input placeholder="Relation" value={cRelation} onChange={(e) => setCRelation(e.target.value)} className="text-sm h-9 rounded-xl" />
                    </div>
                    <div className="flex gap-2">
                      <Input type="tel" inputMode="numeric" placeholder="Mobile *"
                        value={cNumber} onChange={(e) => setCNumber(e.target.value.replace(/\D/g, ''))}
                        className="text-sm h-9 flex-1 rounded-xl" maxLength={15} />
                      <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0"
                        onClick={addContact} disabled={!cName.trim() || !cNumber.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="rounded-xl gap-1.5" onClick={saveEdit} disabled={update.isPending}>
                    {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="h-3.5 w-3.5" />Save</>}
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={cancelEdit} disabled={update.isPending}>
                    <X className="h-3.5 w-3.5" />Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* Read mode */
              <div className="space-y-3 text-sm">
                <Separator />
                <InfoRow icon={Phone}    label="Mobile"     value={user.mobile_number} />
                <InfoRow icon={MapPin}   label="Address"    value={user.address || '—'} />
                <InfoRow icon={Calendar} label="Joined"     value={formatDate(user.date_joined)} />
                <InfoRow icon={Calendar} label="Last login" value={user.last_login ? formatDate(user.last_login) : 'Never'} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional contacts read-only */}
        {!editing && user.additional_contacts.length > 0 && (
          <Card className="rounded-2xl">
            <CardContent className="px-5 py-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Additional Contacts</p>
              {user.additional_contacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold">{c.name}</span>
                    {c.relation && <span className="text-muted-foreground ml-2 text-xs">({c.relation})</span>}
                  </div>
                  <span className="text-muted-foreground">{c.number}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Vishi Participation */}
        <Card className="rounded-2xl">
          <CardContent className="px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Vishi Participation
              {!loadingParticipations && (
                <span className="ml-1.5 font-normal normal-case text-foreground">
                  · {slots.length} slot{slots.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
            {loadingParticipations ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No vishi participations yet.</p>
            ) : (
              <div className="divide-y">
                {slots.map((slot) => (
                  <ParticipationSlotRow
                    key={slot.id}
                    slot={slot}
                    onClick={() => router.push(`/admin/vishis/${slot.vishi_id}`)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        {canClearPassword && (
          <Card className="rounded-2xl">
            <CardContent className="px-5 py-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Admin Actions</p>

              <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 h-10 rounded-xl"
                onClick={() => setConfirmClearPass(true)}>
                <KeyRound className="h-4 w-4 text-muted-foreground" /> Clear Password
              </Button>

              {canAdminActions && (
                <>
                  <Separator />
                  {user.is_active ? (
                    <Button variant="ghost" size="sm"
                      className="w-full justify-start gap-2.5 h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/8"
                      onClick={() => setConfirmDeactivate(true)}>
                      <UserX className="h-4 w-4" /> Deactivate User
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm"
                      className="w-full justify-start gap-2.5 h-10 rounded-xl text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => setConfirmActivate(true)}>
                      <UserCheck className="h-4 w-4" /> Activate User
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeactivate} onOpenChange={setConfirmDeactivate}
        title={`Deactivate ${user.username || user.mobile_number}?`}
        description="What happens:"
        variant="destructive" confirmLabel="Deactivate User"
        onConfirm={() => deactivate.mutate(undefined, { onSuccess: () => setConfirmDeactivate(false) })}
        loading={deactivate.isPending}
      >
        <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
          <li>User cannot log in (account deactivated)</li>
          <li>Participation slots remain — ledger data preserved</li>
          <li>Admin can still collect dues from their slots</li>
          <li>Admin can reactivate the account anytime</li>
        </ul>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmActivate} onOpenChange={setConfirmActivate}
        title={`Activate ${user.username || user.mobile_number}?`}
        description="They will regain access and can log in again."
        confirmLabel="Activate"
        onConfirm={() => activate.mutate(undefined, { onSuccess: () => setConfirmActivate(false) })}
        loading={activate.isPending}
      />

      <ConfirmDialog
        open={confirmClearPass} onOpenChange={setConfirmClearPass}
        title="Clear Password?"
        description="What happens:"
        variant="destructive" confirmLabel="Clear Password"
        onConfirm={() => clearPass.mutate(undefined, { onSuccess: () => setConfirmClearPass(false) })}
        loading={clearPass.isPending}
      >
        <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
          <li>User&apos;s password will be removed</li>
          <li>On next login, they will be prompted to create a new one</li>
          <li>Account data and vishis are not affected</li>
        </ul>
      </ConfirmDialog>
    </AdminRoute>
  )
}


function ParticipationSlotRow({ slot, onClick }: { slot: UserParticipationSlot; onClick: () => void }) {
  const bal    = parseFloat(slot.ledger_balance ?? '0')
  const balCls = bal < 0 ? 'text-rose-500' : bal > 0 ? 'text-sky-500' : 'text-emerald-600'
  const balText = bal < 0
    ? `-₹${Math.abs(bal).toLocaleString('en-IN')}`
    : bal > 0
    ? `+₹${bal.toLocaleString('en-IN')}`
    : '₹0'

  return (
    <div
      className="flex items-center justify-between py-3 gap-3 cursor-pointer hover:opacity-80 active:opacity-60 transition-opacity"
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{slot.vishi_name_full}</p>
        <p className="text-xs text-muted-foreground">
          {slot.vishi_name || 'No alias'} · <span className="capitalize">{slot.vishi_status}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ParticipantStatusBadge is_drawn={slot.is_drawn} is_active={slot.is_active} />
        {slot.ledger_status && (
          <div className="text-right">
            <p className={`text-xs font-bold ${balCls}`}>{balText}</p>
            <LedgerStatusBadge status={slot.ledger_status} />
          </div>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  )
}


function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-muted-foreground text-xs w-20 shrink-0 mt-0.5">{label}</span>
      <span className="font-medium flex-1 break-all text-sm">{value}</span>
    </div>
  )
}
