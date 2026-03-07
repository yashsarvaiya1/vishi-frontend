'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useVishi, useDrawVishi,
  useReleaseVishi, useSkipCycle, useSetFixDraw,
} from '@/hooks/useVishis'
import { useAddParticipant, useRemoveParticipant } from '@/hooks/useParticipants'
import { useUsers } from '@/hooks/useUsers'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft, Pencil, Plus, X, Lock, Loader2,
  Shuffle, Banknote, SkipForward, UserPlus,
} from 'lucide-react'
import AdminRoute from '@/components/shared/AdminRoute'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { VishiStatusBadge, ParticipantStatusBadge } from '@/components/shared/StatusBadge'
import type { VishiAdmin, VishiParticipantAdmin, DrawRecord } from '@/models/vishi'


export default function VishiDetailAdminPage({ id }: { id: number }) {
  const router = useRouter()
  const { data, isLoading } = useVishi(id)
  const vishi = data as VishiAdmin | undefined

  // Action hooks — REMOVED: useActivateVishi (no such endpoint)
  const draw              = useDrawVishi(id)
  const release           = useReleaseVishi(id)
  const skip              = useSkipCycle(id)
  const setFixDraw        = useSetFixDraw(id)
  const removeParticipant = useRemoveParticipant(id)

  // Dialog states
  const [confirmDraw,         setConfirmDraw]         = useState(false)
  const [confirmRelease,      setConfirmRelease]      = useState(false)
  const [showSkipDialog,      setShowSkipDialog]      = useState(false)
  const [skipReason,          setSkipReason]          = useState('')
  const [showFixDrawDialog,   setShowFixDrawDialog]   = useState(false)
  const [showAddParticipant,  setShowAddParticipant]  = useState(false)
  const [removeParticipantId, setRemoveParticipantId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <AdminRoute>
        <LoadingSpinner fullPage label="Loading vishi..." />
      </AdminRoute>
    )
  }

  if (!vishi) {
    return (
      <AdminRoute>
        <p className="text-center text-muted-foreground py-12">Vishi not found.</p>
      </AdminRoute>
    )
  }

  const activeParticipants    = vishi.participants.filter((p) => p.is_active)
  const remainingParticipants = activeParticipants.filter((p) => !p.is_drawn)
  const totalReleasable       = parseFloat(vishi.amount) * activeParticipants.length

  return (
    <AdminRoute>
      <div className="space-y-5 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-xl font-bold truncate">{vishi.name}</h2>
              <p className="text-sm text-muted-foreground">{formatFrequency(vishi.frequency)}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/vishis/${id}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-1.5" /> Edit
          </Button>
        </div>

        {/* Status banner */}
        <Card className="rounded-xl bg-primary/5 border-primary/10">
          <CardContent className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Amount per cycle</p>
                <p className="text-2xl font-bold">{formatCurrency(vishi.amount)}</p>
              </div>
              <VishiStatusBadge status={vishi.status} />
            </div>
            <Separator className="mb-3" />
            <div className="grid grid-cols-4 gap-2 text-center">
              <StatItem label="Cycle"        value={`${vishi.current_cycle}/${vishi.total_cycles}`} />
              <StatItem label="Participants" value={activeParticipants.length} />
              <StatItem label="Remaining"   value={remainingParticipants.length} />
              <StatItem label="Missed"      value={vishi.missed_cycles} />
            </div>
          </CardContent>
        </Card>

        {/* Actions — only shown when active, no upcoming branch (vishi starts active) */}
        {vishi.status === 'active' && (
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {remainingParticipants.length === 0 && vishi.current_cycle === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/50 rounded-lg px-3 py-2">
                  ⚠ No participants yet. Add participants below before drawing.
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDraw(true)}
                  disabled={remainingParticipants.length === 0}
                >
                  <Shuffle className="h-4 w-4 mr-2" /> Draw
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmRelease(true)}
                  disabled={vishi.current_cycle === 0}
                >
                  <Banknote className="h-4 w-4 mr-2" /> Release
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFixDrawDialog(true)}
                  disabled={remainingParticipants.length === 0}
                >
                  <Lock className="h-4 w-4 mr-2" /> Fix Draw
                </Button>
                <Button
                  variant="outline"
                  className="text-amber-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                  onClick={() => setShowSkipDialog(true)}
                >
                  <SkipForward className="h-4 w-4 mr-2" /> Skip Cycle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed banner */}
        {vishi.status === 'completed' && (
          <Card className="rounded-xl bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <CardContent className="px-5 py-3 text-center">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                ✓ Vishi Completed
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                All {vishi.total_cycles} cycles drawn and released.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dates */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Dates</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-y-2.5 text-sm">
              <span className="text-muted-foreground">Draw</span>
              <span className="font-medium">{formatDate(vishi.current_draw_date)}</span>
              <span className="text-muted-foreground">Collection</span>
              <span className="font-medium">{formatDate(vishi.current_collection_date)}</span>
              <span className="text-muted-foreground">Release</span>
              <span className="font-medium">{formatDate(vishi.current_release_date)}</span>
              <span className="text-muted-foreground">Start</span>
              <span>{formatDate(vishi.start_date)}</span>
              <span className="text-muted-foreground">Finish</span>
              <span>{formatDate(vishi.finish_date)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Participants ({activeParticipants.length})
              </CardTitle>
              {vishi.status !== 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowAddParticipant(true)}
                >
                  <UserPlus className="h-3 w-3" /> Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-2 divide-y">
            {vishi.participants.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No participants yet. Add participants to start drawing.
              </p>
            ) : (
              vishi.participants.map((p) => (
                <AdminParticipantRow
                  key={p.id}
                  participant={p}
                  isFixDraw={vishi.fix_draw_participant === p.id}
                  // FIXED: can remove if active AND not yet drawn
                  canRemove={vishi.status !== 'completed' && p.is_active && !p.is_drawn}
                  onRemove={() => setRemoveParticipantId(p.id)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Draw history */}
        {vishi.draw_records.length > 0 && (
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">
                Draw History ({vishi.draw_records.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-2 divide-y">
              {vishi.draw_records.map((r) => (
                <AdminDrawRow
                  key={r.id}
                  record={r}
                  participants={vishi.participants}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Dialogs ──────────────────────────────────────────────────────────── */}

      <ConfirmDialog
        open={confirmDraw}
        onOpenChange={setConfirmDraw}
        title="Perform Draw?"
        description={
          vishi.fix_draw_participant
            ? `🔒 Fixed participant is set — they will be drawn for Cycle ${vishi.current_cycle + 1}.`
            : `${remainingParticipants.length} participant${remainingParticipants.length !== 1 ? 's' : ''} remain. Draw will be random.`
        }
        confirmLabel="Draw Now"
        onConfirm={() => draw.mutate(undefined, { onSuccess: () => setConfirmDraw(false) })}
        loading={draw.isPending}
      />

      <ConfirmDialog
        open={confirmRelease}
        onOpenChange={setConfirmRelease}
        title="Release Funds?"
        description={`Release ${formatCurrency(totalReleasable)} for Cycle ${vishi.current_cycle}? This marks the draw record as released.`}
        confirmLabel="Release"
        onConfirm={() => release.mutate(undefined, { onSuccess: () => setConfirmRelease(false) })}
        loading={release.isPending}
      />

      {/* Skip cycle — needs reason input so uses raw Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Skip This Cycle?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            All upcoming dates shift forward by one cycle period.
            The finish date will be extended accordingly.
          </p>
          <div className="space-y-1.5">
            <Label>
              Reason
              <span className="text-muted-foreground ml-1 font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. Festival break"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={skip.isPending}
              onClick={() =>
                skip.mutate(
                  { reason: skipReason },
                  {
                    onSuccess: () => {
                      setShowSkipDialog(false)
                      setSkipReason('')
                    },
                  }
                )
              }
            >
              {skip.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : 'Skip Cycle'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FixDrawDialog
        open={showFixDrawDialog}
        onClose={() => setShowFixDrawDialog(false)}
        participants={remainingParticipants}
        currentFixId={vishi.fix_draw_participant}
        onConfirm={(participantId) =>
          setFixDraw.mutate(participantId, {
            onSuccess: () => setShowFixDrawDialog(false),
          })
        }
        loading={setFixDraw.isPending}
      />

      {/* FIXED: removed existingUserIds — same user CAN have multiple slots per spec */}
      <AddParticipantDialog
        open={showAddParticipant}
        onClose={() => setShowAddParticipant(false)}
        vishiId={id}
      />

      <ConfirmDialog
        open={removeParticipantId !== null}
        onOpenChange={(open) => { if (!open) setRemoveParticipantId(null) }}
        title="Remove Participant?"
        description="Their ledger will be deactivated. Historical payment records are preserved."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() =>
          removeParticipant.mutate(removeParticipantId!, {
            onSuccess: () => setRemoveParticipantId(null),
          })
        }
        loading={removeParticipant.isPending}
      />
    </AdminRoute>
  )
}


// ─── StatItem ─────────────────────────────────────────────────────────────────

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-bold leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}


// ─── AdminParticipantRow ──────────────────────────────────────────────────────

function AdminParticipantRow({
  participant, isFixDraw, canRemove, onRemove,
}: {
  participant: VishiParticipantAdmin
  isFixDraw:   boolean
  canRemove:   boolean
  onRemove:    () => void
}) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium truncate">
            {participant.vishi_name || participant.user_detail?.username || '—'}
          </p>
          {isFixDraw && (
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0 h-4 border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300"
            >
              <Lock className="h-2.5 w-2.5 mr-1" />Fixed
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {participant.user_detail?.username && participant.vishi_name
            ? `${participant.user_detail.username} · ${participant.user_detail.mobile_number}`
            : participant.user_detail?.mobile_number
          }
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ParticipantStatusBadge
          is_drawn={participant.is_drawn}
          is_active={participant.is_active}
        />
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}


// ─── AdminDrawRow ─────────────────────────────────────────────────────────────

function AdminDrawRow({
  record, participants,
}: {
  record:       DrawRecord
  participants: VishiParticipantAdmin[]
}) {
  const p    = participants.find((x) => x.id === record.participant)
  const name = p?.vishi_name || p?.user_detail?.username || `#${record.participant}`

  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold">Cycle {record.cycle_number}</span>
          {record.was_fixed && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
              <Lock className="h-2.5 w-2.5 mr-1" />Fixed
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {name} · {formatDate(record.drawn_at)}
        </p>
        {record.is_released && record.released_amount && (
          <p className="text-xs text-green-600 font-medium mt-0.5">
            Released: {formatCurrency(record.released_amount)}
          </p>
        )}
      </div>
      <Badge
        variant="outline"
        className={
          record.is_released
            ? 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 text-xs'
            : 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 text-xs'
        }
      >
        {record.is_released ? 'Released' : 'Pending'}
      </Badge>
    </div>
  )
}


// ─── FixDrawDialog ────────────────────────────────────────────────────────────

function FixDrawDialog({
  open, onClose, participants, currentFixId, onConfirm, loading,
}: {
  open:         boolean
  onClose:      () => void
  participants: VishiParticipantAdmin[]
  currentFixId: number | null
  onConfirm:    (id: number) => void
  loading:      boolean
}) {
  const [selected, setSelected] = useState('')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Fixed Draw Participant</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This participant will be selected on the next draw, bypassing the random pick.
        </p>
        {currentFixId !== null && (
          <p className="text-xs text-amber-600 font-medium bg-amber-50 dark:bg-amber-950/50 rounded px-2 py-1.5">
            ⚠ A fixed participant is already set. Confirming will replace it.
          </p>
        )}
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Select participant..." />
          </SelectTrigger>
          <SelectContent>
            {participants.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                <div className="flex flex-col">
                  <span>{p.vishi_name || p.user_detail?.username || '—'}</span>
                  {p.vishi_name && p.user_detail?.username && (
                    <span className="text-xs text-muted-foreground">
                      {p.user_detail.username}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!selected || loading}
            onClick={() => onConfirm(Number(selected))}
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : 'Set Fix Draw'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


// ─── AddParticipantDialog ─────────────────────────────────────────────────────
// FIXED: no existingUserIds filter — same user can have multiple slots per spec

function AddParticipantDialog({
  open, onClose, vishiId,
}: {
  open:    boolean
  onClose: () => void
  vishiId: number
}) {
  const [selectedUser, setSelectedUser] = useState('')
  const [slotName,     setSlotName]     = useState('')

  const { data: usersData }  = useUsers({ ordering: 'username' })
  const addParticipant       = useAddParticipant(vishiId)
  const activeUsers          = (usersData?.results ?? []).filter((u) => u.is_active)

  const handleAdd = () => {
    if (!selectedUser) return
    addParticipant.mutate(
      {
        user:       Number(selectedUser),
        vishi_name: slotName.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose()
          setSelectedUser('')
          setSlotName('')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>User *</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user..." />
              </SelectTrigger>
              <SelectContent>
                {activeUsers.length === 0 ? (
                  <div className="py-3 text-center text-sm text-muted-foreground">
                    No active users found.
                  </div>
                ) : (
                  activeUsers.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      <div className="flex flex-col">
                        <span>{u.username || u.mobile_number}</span>
                        {u.username && (
                          <span className="text-xs text-muted-foreground">
                            {u.mobile_number}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>
              Slot Alias
              <span className="text-muted-foreground ml-1 font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. Raj-Home, Raj-Shop"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
            />
            <p className="text-xs text-muted-foreground pl-0.5">
              Same user can be added multiple times with different aliases.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!selectedUser || addParticipant.isPending}
            onClick={handleAdd}
          >
            {addParticipant.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><Plus className="h-4 w-4 mr-1" />Add Slot</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
