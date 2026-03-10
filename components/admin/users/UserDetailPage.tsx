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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator }         from '@/components/ui/separator'
import { Skeleton }          from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Loader2, Pencil, Check, X,
  ShieldCheck, Phone, MapPin, Calendar, Plus, KeyRound,
  ChevronRight,
} from 'lucide-react'
import AdminRoute     from '@/components/shared/AdminRoute'
import PageHeader     from '@/components/shared/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ConfirmDialog  from '@/components/shared/ConfirmDialog'
import {
  LedgerStatusBadge,
  ParticipantStatusBadge,
} from '@/components/shared/StatusBadge'
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

  // Backend returns UserParticipationSlot[] directly — flat array, no wrapper
  const {
    data: participationSlots,
    isLoading: loadingParticipations,
  } = useUserParticipations(id) as {
    data:      UserParticipationSlot[] | undefined
    isLoading: boolean
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

  const isSelf = user?.mobile_number === myMobile

  const canEdit         = user && (!user.is_superuser || isSelf)
  const canAdminActions = user && !user.is_superuser && !isSelf
  const canClearPassword = user && !user.is_superuser

  const startEdit = () => {
    setUsername(user?.username ?? '')
    setAddress(user?.address ?? '')
    setContacts((user?.additional_contacts ?? []).map((c) => ({ ...c })))
    setCName('')
    setCNumber('')
    setCRelation('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setCName('')
    setCNumber('')
    setCRelation('')
  }

  const addContact = () => {
    if (!cName.trim() || !cNumber.trim()) return
    setContacts((prev) => [
      ...prev,
      { name: cName.trim(), number: cNumber.trim(), relation: cRelation.trim() },
    ])
    setCName('')
    setCNumber('')
    setCRelation('')
  }

  const removeContact = (index: number) =>
    setContacts((prev) => prev.filter((_, i) => i !== index))

  const saveEdit = () => {
    update.mutate(
      {
        username:            username.trim(),
        address:             address.trim(),
        additional_contacts: contacts,
      },
      { onSuccess: () => setEditing(false) }
    )
  }

  if (isLoading) {
    return (
      <AdminRoute>
        <LoadingSpinner fullPage label="Loading user..." />
      </AdminRoute>
    )
  }

  if (!user) {
    return (
      <AdminRoute>
        <p className="text-center text-muted-foreground py-12">User not found.</p>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader back title="User Detail" />

        {/* ── Profile card ── */}
        <Card className="rounded-xl">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                  {getInitials(user.username || user.mobile_number)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base truncate">
                    {user.username || '—'}
                  </p>
                  {user.is_superuser && (
                    <Badge
                      variant="outline"
                      className="text-xs text-primary bg-primary/5 border-primary/20 flex items-center gap-1"
                    >
                      <ShieldCheck className="h-3 w-3" />Admin
                    </Badge>
                  )}
                  {isSelf && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      You
                    </Badge>
                  )}
                  {user.password_set === false && (
                    <Badge
                      variant="outline"
                      className="text-xs text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1"
                    >
                      <KeyRound className="h-2.5 w-2.5" />No password
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{user.mobile_number}</p>
                <Badge
                  variant="outline"
                  className={`mt-1.5 text-xs ${
                    user.is_active
                      ? 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {canEdit && !editing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={startEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* ── Edit mode ── */}
            {editing ? (
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Additional Contacts</Label>

                  {contacts.length > 0 && (
                    <div className="space-y-1.5">
                      {contacts.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-muted rounded-lg px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.number}{c.relation && ` · ${c.relation}`}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeContact(i)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg border p-2.5 space-y-2 bg-muted/30">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Name *"
                        value={cName}
                        onChange={(e) => setCName(e.target.value)}
                        className="text-sm h-8"
                      />
                      <Input
                        placeholder="Relation (e.g. Father)"
                        value={cRelation}
                        onChange={(e) => setCRelation(e.target.value)}
                        className="text-sm h-8"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Mobile number *"
                        value={cNumber}
                        onChange={(e) => setCNumber(e.target.value.replace(/\D/g, ''))}
                        className="text-sm h-8 flex-1"
                        maxLength={15}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={addContact}
                        disabled={!cName.trim() || !cNumber.trim()}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={saveEdit} disabled={update.isPending}>
                    {update.isPending
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <><Check className="h-3.5 w-3.5 mr-1" />Save</>
                    }
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={update.isPending}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />Cancel
                  </Button>
                </div>
              </div>

            ) : (
              /* ── Read mode ── */
              <div className="mt-4 space-y-2.5 text-sm">
                <Separator />
                <InfoRow icon={Phone}    label="Mobile"     value={user.mobile_number} />
                <InfoRow icon={MapPin}   label="Address"    value={user.address || '—'} />
                <InfoRow icon={Calendar} label="Joined"     value={formatDate(user.date_joined)} />
                <InfoRow
                  icon={Calendar}
                  label="Last login"
                  value={user.last_login ? formatDate(user.last_login) : 'Never'}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Additional contacts read-only ── */}
        {!editing && user.additional_contacts.length > 0 && (
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                Additional Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2.5">
              {user.additional_contacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{c.name}</span>
                    {c.relation && (
                      <span className="text-muted-foreground ml-2 text-xs">({c.relation})</span>
                    )}
                  </div>
                  <span className="text-muted-foreground">{c.number}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Vishi Participation (flow §7.3) ── */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
              Vishi Participation
              {!loadingParticipations && (
                <span className="ml-2 font-normal normal-case text-foreground">
                  ({slots.length} slot{slots.length !== 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {loadingParticipations ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No vishi participations yet.
              </p>
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

        {/* ── Admin actions ── */}
        {canClearPassword && (
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2.5">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setConfirmClearPass(true)}
              >
                <KeyRound className="h-4 w-4" />
                Clear Password
              </Button>

              {canAdminActions && (
                <>
                  <Separator />
                  {user.is_active ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setConfirmDeactivate(true)}
                    >
                      Deactivate User
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setConfirmActivate(true)}
                    >
                      Activate User
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Deactivate confirm ── */}
      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title={`Deactivate ${user.username || user.mobile_number}?`}
        description="What happens:"
        variant="destructive"
        confirmLabel="Deactivate User"
        onConfirm={() =>
          deactivate.mutate(undefined, { onSuccess: () => setConfirmDeactivate(false) })
        }
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
        open={confirmActivate}
        onOpenChange={setConfirmActivate}
        title={`Activate ${user.username || user.mobile_number}?`}
        description="They will regain access and can log in again."
        confirmLabel="Activate"
        onConfirm={() =>
          activate.mutate(undefined, { onSuccess: () => setConfirmActivate(false) })
        }
        loading={activate.isPending}
      />

      {/* ── Clear password confirm ── */}
      <ConfirmDialog
        open={confirmClearPass}
        onOpenChange={setConfirmClearPass}
        title="Clear Password?"
        description="What happens:"
        variant="destructive"
        confirmLabel="Clear Password"
        onConfirm={() =>
          clearPass.mutate(undefined, { onSuccess: () => setConfirmClearPass(false) })
        }
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


// ─── Participation Slot Row (flow §7.3) ───────────────────────────────────────

function ParticipationSlotRow({
  slot, onClick,
}: {
  slot:    UserParticipationSlot
  onClick: () => void
}) {
  const bal    = parseFloat(slot.ledger_balance ?? '0')
  const balCls = bal < 0 ? 'text-red-500' : bal > 0 ? 'text-blue-500' : 'text-green-600'
  const balText =
    bal < 0 ? `-₹${Math.abs(bal).toLocaleString('en-IN')}` :
    bal > 0 ? `+₹${bal.toLocaleString('en-IN')}` : '₹0'

  return (
    <div
      className="flex items-center justify-between py-3 gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">
        {/* vishi_name_full = "Family Vishi 2026", vishi_name = "Raj-Home" (slot alias) */}
        <p className="text-sm font-medium truncate">{slot.vishi_name_full}</p>
        <p className="text-xs text-muted-foreground">
          {slot.vishi_name || 'No alias'} · {slot.vishi_status}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ParticipantStatusBadge is_drawn={slot.is_drawn} is_active={slot.is_active} />
        {slot.ledger_status && (
          <div className="text-right">
            <p className={`text-xs font-semibold ${balCls}`}>{balText}</p>
            <LedgerStatusBadge status={slot.ledger_status} />
          </div>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  )
}


// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon, label, value,
}: {
  icon:  React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="font-medium flex-1 break-all">{value}</span>
    </div>
  )
}
