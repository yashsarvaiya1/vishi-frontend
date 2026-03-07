'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useUser, useUpdateUser, useDeactivateUser,
  useActivateUser, useClearUserPassword,
} from '@/hooks/useUsers'
import useAuthStore from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ArrowLeft, Loader2, Pencil, Check, X,
  ShieldCheck, Phone, MapPin, Calendar, Plus,
} from 'lucide-react'
import AdminRoute from '@/components/shared/AdminRoute'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { getInitials, formatDate } from '@/lib/utils'
import type { AdditionalContact } from '@/models/user'


export default function UserDetailPage({ id }: { id: number }) {
  const router   = useRouter()
  const myMobile = useAuthStore((s) => s.mobile_number)

  const { data: user, isLoading } = useUser(id)
  const update     = useUpdateUser(id)
  const deactivate = useDeactivateUser(id)
  const activate   = useActivateUser(id)
  const clearPass  = useClearUserPassword(id)

  // Edit form state
  const [editing,   setEditing]   = useState(false)
  const [username,  setUsername]  = useState('')
  const [address,   setAddress]   = useState('')
  const [contacts,  setContacts]  = useState<AdditionalContact[]>([])
  const [cName,     setCName]     = useState('')
  const [cNumber,   setCNumber]   = useState('')
  const [cRelation, setCRelation] = useState('')

  // Confirm dialog states
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [confirmActivate,   setConfirmActivate]   = useState(false)
  const [confirmClearPass,  setConfirmClearPass]  = useState(false)

  const isSelf   = user?.mobile_number === myMobile
  const canEdit  = user && (!user.is_superuser || isSelf)
  const canAdmin = user && !user.is_superuser && !isSelf

  const startEdit = () => {
    setUsername(user?.username ?? '')
    setAddress(user?.address ?? '')
    // Deep-copy so edits don't mutate cached query data
    setContacts(user?.additional_contacts?.map((c) => ({ ...c })) ?? [])
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
      <div className="space-y-5 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">User Detail</h2>
        </div>

        {/* Profile card */}
        <Card className="rounded-xl">
          <CardContent className="pt-5 pb-5 px-5">
            {/* Avatar + name row */}
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
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={startEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* ── EDIT MODE ── */}
            {editing ? (
              <div className="mt-4 space-y-3">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <Separator />

                {/* Additional contacts edit */}
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

                  {/* Add contact row */}
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

                {/* Save / Cancel */}
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
              /* ── READ MODE ── */
              <div className="mt-4 space-y-2.5 text-sm">
                <Separator />
                <InfoRow icon={Phone}    label="Mobile"     value={user.mobile_number} />
                <InfoRow icon={MapPin}   label="Address"    value={user.address || '—'} />
                <InfoRow icon={Calendar} label="Joined"     value={formatDate(user.date_joined)} />
                <InfoRow icon={Calendar} label="Last login" value={formatDate(user.last_login)} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional contacts — read-only card (only shown outside edit mode) */}
        {!editing && user.additional_contacts?.length > 0 && (
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

        {/* Admin actions */}
        {canAdmin && (
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
                className="w-full justify-start"
                onClick={() => setConfirmClearPass(true)}
              >
                Clear Password
              </Button>
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
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title={`Deactivate ${user.username || user.mobile_number}?`}
        description="They will immediately lose access and cannot log in."
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={() => deactivate.mutate(undefined, { onSuccess: () => setConfirmDeactivate(false) })}
        loading={deactivate.isPending}
      />
      <ConfirmDialog
        open={confirmActivate}
        onOpenChange={setConfirmActivate}
        title={`Activate ${user.username || user.mobile_number}?`}
        description="They will regain access and can log in again."
        confirmLabel="Activate"
        onConfirm={() => activate.mutate(undefined, { onSuccess: () => setConfirmActivate(false) })}
        loading={activate.isPending}
      />
      <ConfirmDialog
        open={confirmClearPass}
        onOpenChange={setConfirmClearPass}
        title="Clear Password?"
        description={`${user.username || user.mobile_number}'s password will be cleared. They must set a new one on next login.`}
        confirmLabel="Clear Password"
        variant="destructive"
        onConfirm={() => clearPass.mutate(undefined, { onSuccess: () => setConfirmClearPass(false) })}
        loading={clearPass.isPending}
      />
    </AdminRoute>
  )
}

function InfoRow({
  icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="font-medium flex-1 break-all">{value}</span>
    </div>
  )
}
