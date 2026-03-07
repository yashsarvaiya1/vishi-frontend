'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useUsers, useCreateUser,
  useDeactivateUser, useActivateUser, useClearUserPassword,
} from '@/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Plus, Search, MoreVertical, Loader2, Users, ShieldCheck, X, UserPlus,
} from 'lucide-react'
import AdminRoute from '@/components/shared/AdminRoute'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { getInitials, formatDate } from '@/lib/utils'
import type { User, AdditionalContact } from '@/models/user'


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageUsersPage() {
  const router = useRouter()
  const [search,     setSearch]     = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useUsers({ search })
  const users    = data?.results ?? []
  const nonAdmin = users.filter((u) => !u.is_superuser)

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader
          title="Manage Users"
          subtitle={!isLoading ? `${users.length} total · ${nonAdmin.length} members` : undefined}
        >
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add User
          </Button>
        </PageHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or mobile..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* User list */}
        <div className="space-y-2.5">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search ? `No results for "${search}"` : 'No users yet'}
              description={!search ? 'Add a user to get started.' : undefined}
            >
              {!search && (
                <Button size="sm" onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add User
                </Button>
              )}
            </EmptyState>
          ) : (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => router.push(`/admin/users/${user.id}`)}
              />
            ))
          )}
        </div>
      </div>

      <CreateUserDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </AdminRoute>
  )
}


// ─── User card ────────────────────────────────────────────────────────────────

function UserCard({ user, onClick }: { user: User; onClick: () => void }) {
  const deactivate    = useDeactivateUser(user.id)
  const activate      = useActivateUser(user.id)
  const clearPassword = useClearUserPassword(user.id)

  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [confirmActivate,   setConfirmActivate]   = useState(false)
  const [confirmClearPass,  setConfirmClearPass]  = useState(false)

  const anyPending = deactivate.isPending || activate.isPending || clearPassword.isPending

  return (
    <>
      <Card className="rounded-xl">
        <CardContent className="px-4 py-3 flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 cursor-pointer" onClick={onClick}>
            <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
              {getInitials(user.username || user.mobile_number)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-medium text-sm truncate">
                {user.username || '—'}
              </p>
              {user.is_superuser && (
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0 h-4 text-primary bg-primary/5 border-primary/20"
                >
                  <ShieldCheck className="h-2.5 w-2.5 mr-1" />Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.mobile_number}</p>
            <p className="text-xs text-muted-foreground">
              Joined {formatDate(user.date_joined)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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

            {!user.is_superuser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={anyPending}
                  >
                    {anyPending
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <MoreVertical className="h-4 w-4" />
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => setConfirmClearPass(true)}>
                    Clear Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.is_active ? (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => setConfirmDeactivate(true)}
                    >
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => setConfirmActivate(true)}>
                      Activate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title={`Deactivate ${user.username || user.mobile_number}?`}
        description="They will lose access immediately and won't be able to log in."
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
        onConfirm={() => clearPassword.mutate(undefined, { onSuccess: () => setConfirmClearPass(false) })}
        loading={clearPassword.isPending}
      />
    </>
  )
}


// ─── Create user dialog ───────────────────────────────────────────────────────

function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mobile,    setMobile]    = useState('')
  const [username,  setUsername]  = useState('')
  const [address,   setAddress]   = useState('')

  // Additional contacts
  const [contacts,  setContacts]  = useState<AdditionalContact[]>([])
  const [cName,     setCName]     = useState('')
  const [cNumber,   setCNumber]   = useState('')
  const [cRelation, setCRelation] = useState('')

  const { mutate, isPending } = useCreateUser()

  const reset = () => {
    setMobile('')
    setUsername('')
    setAddress('')
    setContacts([])
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(
      {
        mobile_number:        mobile.trim(),
        username:             username.trim()  || undefined,
        address:              address.trim()   || undefined,
        additional_contacts:  contacts.length > 0 ? contacts : undefined,
      },
      { onSuccess: () => { onClose(); reset() } }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset() } }}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Core fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Mobile Number *</Label>
              <Input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9001234567"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Name{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="Raj Shah"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Address{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="123 Main St, Ahmedabad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Additional contacts */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Additional Contacts</Label>
              <span className="text-xs text-muted-foreground">optional</span>
            </div>

            {/* Added contacts */}
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
            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
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
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { onClose(); reset() }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || mobile.trim().length < 10}
            >
              {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><UserPlus className="h-4 w-4 mr-1.5" />Create</>
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
