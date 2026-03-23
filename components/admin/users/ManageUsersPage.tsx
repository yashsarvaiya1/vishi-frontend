// components/admin/users/ManageUsersPage.tsx
'use client'

import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import {
  useUsers, useCreateUser,
  useDeactivateUser, useActivateUser, useClearUserPassword,
} from '@/hooks/useUsers'
import { Button }            from '@/components/ui/button'
import { Input }             from '@/components/ui/input'
import { Label }             from '@/components/ui/label'
import { Badge }             from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton }          from '@/components/ui/skeleton'
import { Separator }         from '@/components/ui/separator'
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
  Plus, Search, MoreVertical, Loader2,
  Users, ShieldCheck, X, UserPlus, KeyRound,
} from 'lucide-react'
import AdminRoute    from '@/components/shared/AdminRoute'
import PageHeader    from '@/components/shared/PageHeader'
import EmptyState    from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { getInitials, formatDate } from '@/lib/utils'
import type { User, AdditionalContact } from '@/models/user'


type ActiveFilter = 'all' | 'active' | 'inactive'

const FILTER_TABS: { label: string; value: ActiveFilter }[] = [
  { label: 'All',      value: 'all'      },
  { label: 'Active',   value: 'active'   },
  { label: 'Inactive', value: 'inactive' },
]


export default function ManageUsersPage() {
  const router = useRouter()
  const [search,       setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [showCreate,   setShowCreate]   = useState(false)

  const { data, isLoading } = useUsers({
    search,
    ...(activeFilter !== 'all' ? { is_active: activeFilter === 'active' } : {}),
  })
  const users    = data?.results ?? []
  const notSetup = users.filter((u) => u.password_set === false).length

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader
          title="Users"
          subtitle={!isLoading ? `${data?.count ?? 0} total` : undefined}
        >
          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </PageHeader>

        {/* No-password warning */}
        {notSetup > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-bold">{notSetup}</span> user{notSetup !== 1 ? 's' : ''} haven&apos;t set a password yet
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or mobile..."
            className="pl-9 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {FILTER_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* User list */}
        <div className="space-y-2.5">
          {isLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search ? `No results for "${search}"` : 'No users yet'}
              description={!search ? 'Add a user to get started.' : undefined}
            >
              {!search && (
                <Button size="sm" className="rounded-xl" onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add User
                </Button>
              )}
            </EmptyState>
          ) : (
            users.map((user) => (
              <UserCard key={user.id} user={user} onClick={() => router.push(`/admin/users/${user.id}`)} />
            ))
          )}
        </div>
      </div>

      <CreateUserDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </AdminRoute>
  )
}


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
      <Card className="rounded-2xl hover:shadow-sm hover:border-primary/20 transition-all">
        <CardContent className="px-4 py-3 flex items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0 cursor-pointer" onClick={onClick}>
            <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
              {getInitials(user.username || user.mobile_number)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-sm truncate">{user.username || '—'}</p>
              {user.is_superuser && (
                <Badge variant="outline" className="border-0 text-[11px] px-1.5 py-0 h-4 rounded-full text-primary bg-primary/10 font-semibold">
                  <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />Admin
                </Badge>
              )}
              {user.password_set === false && (
                <Badge variant="outline" className="border-0 text-[11px] px-1.5 py-0 h-4 rounded-full text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">
                  <KeyRound className="h-2.5 w-2.5 mr-0.5" />No password
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.mobile_number}</p>
            <p className="text-xs text-muted-foreground">Joined {formatDate(user.date_joined)}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={
              user.is_active
                ? 'border-0 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'border-0 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800'
            }>
              {user.is_active ? '● Active' : 'Inactive'}
            </Badge>

            {!user.is_superuser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"
                    disabled={anyPending} onClick={(e) => e.stopPropagation()}>
                    {anyPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  <DropdownMenuItem onClick={() => setConfirmClearPass(true)}>
                    <KeyRound className="h-3.5 w-3.5 mr-2" />Clear Password
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
                    <DropdownMenuItem onClick={() => setConfirmActivate(true)}>Activate</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeactivate} onOpenChange={setConfirmDeactivate}
        title={`Deactivate ${user.username || user.mobile_number}?`}
        description="They will lose access immediately."
        confirmLabel="Deactivate" variant="destructive"
        onConfirm={() => deactivate.mutate(undefined, { onSuccess: () => setConfirmDeactivate(false) })}
        loading={deactivate.isPending}
      />
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
        description={`${user.username || user.mobile_number}'s password will be cleared. They must set a new one on next login.`}
        confirmLabel="Clear Password" variant="destructive"
        onConfirm={() => clearPassword.mutate(undefined, { onSuccess: () => setConfirmClearPass(false) })}
        loading={clearPassword.isPending}
      />
    </>
  )
}


function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mobile,    setMobile]    = useState('')
  const [username,  setUsername]  = useState('')
  const [address,   setAddress]   = useState('')
  const [contacts,  setContacts]  = useState<AdditionalContact[]>([])
  const [cName,     setCName]     = useState('')
  const [cNumber,   setCNumber]   = useState('')
  const [cRelation, setCRelation] = useState('')

  const { mutate, isPending } = useCreateUser()

  const reset = () => {
    setMobile(''); setUsername(''); setAddress(''); setContacts([])
    setCName(''); setCNumber(''); setCRelation('')
  }

  const addContact = () => {
    if (!cName.trim() || !cNumber.trim()) return
    setContacts((prev) => [...prev, { name: cName.trim(), number: cNumber.trim(), relation: cRelation.trim() }])
    setCName(''); setCNumber(''); setCRelation('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mobile.trim().length < 10) return
    mutate(
      {
        mobile_number:       mobile.trim(),
        username:            username.trim()  || undefined,
        address:             address.trim()   || undefined,
        additional_contacts: contacts.length > 0 ? contacts : undefined,
      },
      { onSuccess: () => { onClose(); reset() } }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset() } }}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Mobile Number *</Label>
              <Input type="tel" inputMode="numeric" autoComplete="tel"
                placeholder="9001234567" value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                autoFocus maxLength={15} className="rounded-xl h-10" />
              {mobile.length > 0 && mobile.length < 10 && (
                <p className="text-xs text-destructive">Enter at least 10 digits.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input placeholder="Raj Shah" value={username}
                onChange={(e) => setUsername(e.target.value)} className="rounded-xl h-10" />
            </div>
            <div className="space-y-1.5">
              <Label>Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input placeholder="123 Main St, Ahmedabad" value={address}
                onChange={(e) => setAddress(e.target.value)} className="rounded-xl h-10" />
            </div>
          </div>

          <Separator />

          {/* Additional contacts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Additional Contacts</p>
              <span className="text-xs text-muted-foreground">optional</span>
            </div>

            {contacts.length > 0 && (
              <div className="space-y-1.5">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded-xl px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.number}{c.relation && ` · ${c.relation}`}</p>
                    </div>
                    <button type="button" onClick={() => setContacts((prev) => prev.filter((_, idx) => idx !== i))}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border p-3 space-y-2 bg-muted/30">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Name *" value={cName} onChange={(e) => setCName(e.target.value)} className="text-sm h-9 rounded-lg" />
                <Input placeholder="Relation" value={cRelation} onChange={(e) => setCRelation(e.target.value)} className="text-sm h-9 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Input type="tel" inputMode="numeric" placeholder="Mobile *" value={cNumber}
                  onChange={(e) => setCNumber(e.target.value.replace(/\D/g, ''))}
                  className="text-sm h-9 rounded-lg flex-1" maxLength={15} />
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg"
                  onClick={addContact} disabled={!cName.trim() || !cNumber.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { onClose(); reset() }}
              disabled={isPending} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={isPending || mobile.trim().length < 10} className="rounded-xl gap-1.5">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" />Create</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
