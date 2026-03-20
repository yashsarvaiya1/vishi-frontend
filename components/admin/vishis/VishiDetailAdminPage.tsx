// components/admin/vishis/VishiDetailAdminPage.tsx
'use client'

import { useState }                from 'react'
import { useRouter }               from 'next/navigation'
import {
  useVishi, useDrawVishi, useReleaseVishi, useActivateVishi,
  useSkipCycle, useSetFixDraw, useSkipRecords,
} from '@/hooks/useVishis'
import {
  useAddParticipant, useUpdateParticipant,
  useRemoveParticipant, useChargeWaive,
} from '@/hooks/useParticipants'
import { useRecordPayment, useLedgers }                from '@/hooks/useLedgers'
import { useUsers }                                    from '@/hooks/useUsers'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Button }         from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import { Label }          from '@/components/ui/label'
import { Badge }          from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator }      from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pencil, Lock, Loader2, Shuffle, Banknote,
  SkipForward, UserPlus, MoreVertical,
  IndianRupee, AlertTriangle, Clock, X, Plus, PlayCircle,
  MinusCircle, CheckCircle,
} from 'lucide-react'
import AdminRoute         from '@/components/shared/AdminRoute'
import PageHeader         from '@/components/shared/PageHeader'
import LoadingSpinner     from '@/components/shared/LoadingSpinner'
import ConfirmDialog      from '@/components/shared/ConfirmDialog'
import DrawAnimation      from '@/components/shared/DrawAnimation'
import {
  VishiStatusBadge, LedgerStatusBadge,
  ParticipantStatusBadge, getVishiDisplayStatus,
} from '@/components/shared/StatusBadge'
import type {
  VishiAdmin, VishiParticipantAdmin, DrawRecord, DrawPayload,
} from '@/models/vishi'
import type { CollectionLedger } from '@/models/ledger'
import type { SkipRecord }       from '@/models/dashboard'


export default function VishiDetailAdminPage({ id }: { id: number }) {
  const router = useRouter()
  const { data, isLoading } = useVishi(id)
  const vishi = data as VishiAdmin | undefined

  const [showDrawAnim,        setShowDrawAnim]        = useState(false)
  const [drawWinner,          setDrawWinner]          = useState<DrawRecord | null>(null)
  const [showPreDraw,         setShowPreDraw]         = useState(false)
  const [preDrawFixId,        setPreDrawFixId]        = useState<string>('random')
  const [showRelease,         setShowRelease]         = useState(false)
  const [showSkipDialog,      setShowSkipDialog]      = useState(false)
  const [skipReason,          setSkipReason]          = useState('')
  const [showAddParticipant,  setShowAddParticipant]  = useState(false)
  const [removeParticipantId, setRemoveParticipantId] = useState<number | null>(null)
  const [editSlotParticipant, setEditSlotParticipant] = useState<VishiParticipantAdmin | null>(null)
  const [collectParticipant,  setCollectParticipant]  = useState<VishiParticipantAdmin | null>(null)
  // ← ADDED: charge/waive dialog state
  const [chargeWaiveParticipant, setChargeWaiveParticipant] = useState<VishiParticipantAdmin | null>(null)

  const draw              = useDrawVishi(id)
  const release           = useReleaseVishi(id)
  const skip              = useSkipCycle(id)
  const activate          = useActivateVishi(id)
  const removeParticipant = useRemoveParticipant(id)
  const { data: skipRecordsData } = useSkipRecords(id)
  const skipRecords = (skipRecordsData?.results ?? []) as SkipRecord[]

  if (isLoading) return <AdminRoute><LoadingSpinner fullPage label="Loading vishi..." /></AdminRoute>
  if (!vishi)   return <AdminRoute><p className="text-center text-muted-foreground py-12">Vishi not found.</p></AdminRoute>

  const activeParticipants    = vishi.participants.filter((p) => p.is_active)
  const remainingParticipants = activeParticipants.filter((p) => !p.is_drawn)
  const winners               = activeParticipants.filter((p) => p.is_drawn)

  const today       = new Date()
  const drawDate    = new Date(vishi.current_draw_date)
  const latestDraw  = vishi.draw_records[vishi.draw_records.length - 1]

  const drawOverdue = vishi.status === 'active'
    && today >= drawDate
    && !vishi.draw_records.find((r) => r.cycle_number === vishi.current_cycle + 1)

  // ← FIXED: release pending just means latest draw is unreleased — no date check
  const releasePending = vishi.status === 'active'
    && !!latestDraw
    && !latestDraw.is_released

  const displayStatus = getVishiDisplayStatus(vishi.status, {
    draw_overdue:    drawOverdue,
    release_pending: releasePending,
  })

  const handleDraw = () => {
    const payload: DrawPayload = preDrawFixId !== 'random'
      ? { fix_participant_id: Number(preDrawFixId) }
      : {}
    draw.mutate(payload, {
      onSuccess: (res) => {
        setShowPreDraw(false)
        setPreDrawFixId('random')
        const winner = res?.data as DrawRecord | undefined
        if (winner) { setDrawWinner(winner); setShowDrawAnim(true) }
      },
    })
  }

  const handleRelease = () => {
    release.mutate(undefined, { onSuccess: () => setShowRelease(false) })
  }

  return (
    <AdminRoute>
      {showDrawAnim && drawWinner && (
        <DrawAnimation
          vishiId    ={vishi.id}
          cycleNumber={drawWinner.cycle_number}
          winnerName ={drawWinner.participant_name}
          username   ={drawWinner.username}
          amount     ={drawWinner.released_amount ?? vishi.amount}
          wasFixed   ={drawWinner.was_fixed}
          onDone     ={() => { setShowDrawAnim(false); setDrawWinner(null) }}
        />
      )}

      <div className="space-y-5">
        <PageHeader back title={vishi.name} subtitle={formatFrequency(vishi.frequency)}>
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/vishis/${id}/edit`)}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
        </PageHeader>

        {/* Status + cycle banner */}
        <Card className="rounded-xl bg-primary/5 border-primary/10">
          <CardContent className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Amount per cycle</p>
                <p className="text-2xl font-bold">{formatCurrency(vishi.amount)}</p>
              </div>
              <VishiStatusBadge status={displayStatus} />
            </div>
            {vishi.total_cycles > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Cycle {vishi.current_cycle} of {vishi.total_cycles}</span>
                  <span>{remainingParticipants.length} remaining</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${vishi.total_cycles > 0 ? (vishi.current_cycle / vishi.total_cycles) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
            <Separator className="mb-3" />
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="font-bold">{formatDate(vishi.current_draw_date)}</p>
                <p className="text-xs text-muted-foreground">Draw</p>
              </div>
              <div>
                <p className="font-bold">{formatDate(vishi.current_collection_date)}</p>
                <p className="text-xs text-muted-foreground">Collection</p>
              </div>
              <div>
                <p className="font-bold">{formatDate(vishi.current_release_date)}</p>
                <p className="text-xs text-muted-foreground">Release</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t grid grid-cols-2 text-xs text-muted-foreground gap-y-1">
              <span>Start</span><span className="font-medium text-right">{formatDate(vishi.start_date)}</span>
              <span>Finish</span><span className="font-medium text-right">{formatDate(vishi.finish_date)}</span>
              {vishi.missed_cycles > 0 && (
                <><span>Missed</span><span className="font-medium text-right text-amber-600">{vishi.missed_cycles}</span></>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming — activate banner */}
        {vishi.status === 'upcoming' && (
          <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
            <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Ready to activate</p>
              <p className="text-xs text-muted-foreground">
                {vishi.total_cycles === 0
                  ? 'Add participants first.'
                  : `${vishi.total_cycles} participant${vishi.total_cycles !== 1 ? 's' : ''} · ${formatDate(vishi.start_date)} start`
                }
              </p>
            </div>
            {vishi.total_cycles > 0 && (
              <Button size="sm" className="h-8 text-xs shrink-0" disabled={activate.isPending} onClick={() => activate.mutate()}>
                {activate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Activate'}
              </Button>
            )}
          </div>
        )}

        {/* Draw overdue banner */}
        {drawOverdue && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Draw Overdue</p>
              <p className="text-xs text-muted-foreground">Due on {formatDate(vishi.current_draw_date)}</p>
            </div>
            <Button size="sm" className="h-8 text-xs shrink-0 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setShowPreDraw(true)}>
              Draw Now
            </Button>
          </div>
        )}

        {/* Release pending banner */}
        {releasePending && (
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
            <Clock className="h-4 w-4 text-blue-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Release Pending</p>
              <p className="text-xs text-muted-foreground">
                {latestDraw?.participant_name} won Cycle {latestDraw?.cycle_number}
              </p>
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => setShowRelease(true)}>
              Release
            </Button>
          </div>
        )}

        {/* Completed banner */}
        {vishi.status === 'completed' && (
          <div className="rounded-xl bg-teal-50 dark:bg-teal-900/20 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">✓ Vishi Completed</p>
            <p className="text-xs text-muted-foreground mt-0.5">All {vishi.total_cycles} cycles drawn and released.</p>
          </div>
        )}

        {/* Active action buttons */}
        {vishi.status === 'active' && (
          <div className="flex gap-2 flex-wrap">
            {!drawOverdue && remainingParticipants.length > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowPreDraw(true)}>
                <Shuffle className="h-3.5 w-3.5" /> Draw
              </Button>
            )}
            {latestDraw && !latestDraw.is_released && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowRelease(true)}>
                <Banknote className="h-3.5 w-3.5" /> Release
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5 text-amber-600 hover:text-amber-600 hover:bg-amber-50" onClick={() => setShowSkipDialog(true)}>
              <SkipForward className="h-3.5 w-3.5" /> Skip Cycle
            </Button>
          </div>
        )}

        {/* TABS */}
        <Tabs defaultValue="participants">
          <TabsList className="w-full">
            <TabsTrigger value="participants" className="flex-1">
              Participants
              <span className="ml-1.5 text-xs opacity-70">({activeParticipants.length})</span>
            </TabsTrigger>
            <TabsTrigger value="draw-history" className="flex-1">Draws</TabsTrigger>
            <TabsTrigger value="payments" className="flex-1">
              Payments
              {vishi.pending_payments_count > 0 && (
                <span className="ml-1.5 text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0">
                  {vishi.pending_payments_count}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Participants */}
          <TabsContent value="participants" className="mt-3 space-y-3">
            {vishi.status !== 'completed' && (
              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => setShowAddParticipant(true)}>
                <UserPlus className="h-3.5 w-3.5" /> Add Participant
              </Button>
            )}
            {vishi.participants.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">No participants yet.</p>
            ) : (
              <>
                {remainingParticipants.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Current Pool ({remainingParticipants.length})
                    </p>
                    <Card className="rounded-xl">
                      <CardContent className="px-4 py-2 divide-y">
                        {remainingParticipants.map((p) => (
                          <AdminParticipantRow
                            key={p.id} participant={p}
                            vishiId={id} vishiStatus={vishi.status}
                            currentCycle={vishi.current_cycle}
                            isFixDraw={vishi.fix_draw_participant === p.id}
                            onEditSlotName={() => setEditSlotParticipant(p)}
                            onRemove={() => setRemoveParticipantId(p.id)}
                            onCollect={() => setCollectParticipant(p)}
                            onChargeWaive={() => setChargeWaiveParticipant(p)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
                {winners.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Winners ({winners.length})
                    </p>
                    <Card className="rounded-xl">
                      <CardContent className="px-4 py-2 divide-y">
                        {winners.map((p) => (
                          <AdminParticipantRow
                            key={p.id} participant={p}
                            vishiId={id} vishiStatus={vishi.status}
                            currentCycle={vishi.current_cycle}
                            isFixDraw={false}
                            onEditSlotName={() => setEditSlotParticipant(p)}
                            onRemove={() => setRemoveParticipantId(p.id)}
                            onCollect={() => setCollectParticipant(p)}
                            onChargeWaive={() => setChargeWaiveParticipant(p)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
                {vishi.participants.filter((p) => !p.is_active).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Removed ({vishi.participants.filter((p) => !p.is_active).length})
                    </p>
                    <Card className="rounded-xl border-dashed opacity-60">
                      <CardContent className="px-4 py-2 divide-y">
                        {vishi.participants.filter((p) => !p.is_active).map((p) => (
                          <AdminParticipantRow
                            key={p.id} participant={p}
                            vishiId={id} vishiStatus={vishi.status}
                            currentCycle={vishi.current_cycle}
                            isFixDraw={false}
                            onEditSlotName={() => {}} onRemove={() => {}}
                            onCollect={() => setCollectParticipant(p)}
                            onChargeWaive={() => setChargeWaiveParticipant(p)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* TAB 2: Draw History */}
          <TabsContent value="draw-history" className="mt-3">
            <Card className="rounded-xl">
              <CardContent className="px-4 py-3 divide-y">
                {vishi.draw_records.length === 0 && skipRecords.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-6">No draws yet.</p>
                ) : (
                  <>
                    {[...vishi.draw_records]
                      .sort((a, b) => b.cycle_number - a.cycle_number)
                      .map((r) => (
                        <DrawHistoryRow key={`draw-${r.id}`} record={r} onRelease={() => setShowRelease(true)} />
                      ))}
                    {skipRecords.map((sr) => (
                      <SkipRecordRow key={`skip-${sr.id}`} record={sr} />
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Payments */}
          <TabsContent value="payments" className="mt-3">
            <PaymentsTab vishiId={id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Pre-draw Dialog */}
      <Dialog open={showPreDraw} onOpenChange={(o) => { if (!o) { setShowPreDraw(false); setPreDrawFixId('random') } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Draw — Cycle {vishi.current_cycle + 1}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Pool ({remainingParticipants.length})
              </p>
              <div className="rounded-lg bg-muted/50 divide-y max-h-48 overflow-y-auto">
                {remainingParticipants.map((p) => (
                  <div key={p.id} className="px-3 py-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{p.vishi_name || p.user_detail?.username || '—'}</span>
                    {vishi.fix_draw_participant === p.id && (
                      <Badge variant="outline" className="text-xs px-1.5 h-4 gap-0.5">
                        <Lock className="h-2.5 w-2.5" />Fixed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fix Draw <span className="font-normal">(optional)</span></Label>
              <Select value={preDrawFixId} onValueChange={setPreDrawFixId}>
                <SelectTrigger><SelectValue placeholder="Random draw (default)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random draw (default)</SelectItem>
                  {remainingParticipants.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.vishi_name || p.user_detail?.username || '—'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {preDrawFixId !== 'random' && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Fixed: this participant will win Cycle {vishi.current_cycle + 1}.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPreDraw(false); setPreDrawFixId('random') }}>Cancel</Button>
            <Button disabled={draw.isPending || remainingParticipants.length === 0} onClick={handleDraw}>
              {draw.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Shuffle className="h-4 w-4 mr-1.5" />Draw Now</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Dialog */}
      <Dialog open={showRelease} onOpenChange={setShowRelease}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Release Funds — Cycle {latestDraw?.cycle_number}</DialogTitle></DialogHeader>
          {latestDraw && (
            <div className="rounded-lg bg-muted px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Winner</span>
                <span className="font-semibold">{latestDraw.participant_name || latestDraw.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">{formatCurrency(parseFloat(vishi.amount) * activeParticipants.length)}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                ₹{vishi.amount} × {activeParticipants.length} active participants — calculated automatically.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRelease(false)} disabled={release.isPending}>Cancel</Button>
            <Button onClick={handleRelease} disabled={release.isPending}>
              {release.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Banknote className="h-4 w-4 mr-1.5" />Confirm Release</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Cycle Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Skip This Cycle?</DialogTitle></DialogHeader>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-4 py-3 space-y-2 text-sm">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">All dates shift forward</p>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="text-muted-foreground">Draw</span><span className="font-medium">{formatDate(vishi.current_draw_date)}</span>
              <span className="text-muted-foreground">Collection</span><span className="font-medium">{formatDate(vishi.current_collection_date)}</span>
              <span className="text-muted-foreground">Release</span><span className="font-medium">{formatDate(vishi.current_release_date)}</span>
              <span className="text-muted-foreground">Finish</span><span className="font-medium">{formatDate(vishi.finish_date)}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reason <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input placeholder="e.g. Festival break" value={skipReason} onChange={(e) => setSkipReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" disabled={skip.isPending}
              onClick={() => skip.mutate({ reason: skipReason }, { onSuccess: () => { setShowSkipDialog(false); setSkipReason('') } })}
            >
              {skip.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Skip Cycle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Slot Name */}
      {editSlotParticipant && (
        <EditSlotNameDialog participant={editSlotParticipant} vishiId={id} onClose={() => setEditSlotParticipant(null)} />
      )}

      {/* Add Participant */}
      <AddParticipantDialog
        open={showAddParticipant} onClose={() => setShowAddParticipant(false)}
        vishiId={id} isActive={vishi.status === 'active'} existingParticipants={activeParticipants}
      />

      {/* Remove Participant */}
      <ConfirmDialog
        open={removeParticipantId !== null}
        onOpenChange={(open) => { if (!open) setRemoveParticipantId(null) }}
        title="Remove Participant?"
        description="Participant slot deactivated, payment history preserved, future charges stopped."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => removeParticipant.mutate(removeParticipantId!, { onSuccess: () => setRemoveParticipantId(null) })}
        loading={removeParticipant.isPending}
      />

      {/* Collect Payment */}
      {collectParticipant && (
        <CollectFromParticipantDialog vishiId={id} participant={collectParticipant} onClose={() => setCollectParticipant(null)} />
      )}

      {/* ← ADDED: Charge / Waive Dialog */}
      {chargeWaiveParticipant && (
        <ChargeWaiveDialog
          vishiId={id}
          participant={chargeWaiveParticipant}
          currentCycle={vishi.current_cycle}
          onClose={() => setChargeWaiveParticipant(null)}
        />
      )}
    </AdminRoute>
  )
}


// ─── Admin Participant Row ────────────────────────────────────────────────────

function AdminParticipantRow({
  participant, vishiId, vishiStatus, currentCycle, isFixDraw,
  onEditSlotName, onRemove, onCollect, onChargeWaive,
}: {
  participant:    VishiParticipantAdmin
  vishiId:        number
  vishiStatus:    string
  currentCycle:   number
  isFixDraw:      boolean
  onEditSlotName: () => void
  onRemove:       () => void
  onCollect:      () => void
  onChargeWaive:  () => void          // ← ADDED
}) {
  const router   = useRouter()
  const bal      = parseFloat(participant.ledger_balance ?? '0')
  const balCls   = bal < 0 ? 'text-red-500' : bal > 0 ? 'text-blue-500' : 'text-green-600'
  const balText  = bal < 0 ? `Owes ₹${Math.abs(bal).toLocaleString('en-IN')}` :
                   bal > 0 ? `Credit ₹${bal.toLocaleString('en-IN')}` : 'Settled'
  const canRemove = vishiStatus !== 'completed' && participant.is_active

  return (
    <div className="flex items-start justify-between py-3 gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium truncate">
            {participant.vishi_name || participant.user_detail?.username || '—'}
          </p>
          {isFixDraw && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-amber-300 text-amber-700 bg-amber-50">
              <Lock className="h-2.5 w-2.5 mr-0.5" />Fixed
            </Badge>
          )}
          <ParticipantStatusBadge is_drawn={participant.is_drawn} is_active={participant.is_active} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {participant.user_detail?.mobile_number ?? ''}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs font-semibold ${balCls}`}>{balText}</span>
          {participant.ledger_status && <LedgerStatusBadge status={participant.ledger_status} />}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {participant.is_active && participant.ledger_status === 'due' && (
          <Button size="sm" variant="default" className="h-7 text-xs gap-0.5 px-2.5" onClick={onCollect}>
            <IndianRupee className="h-3 w-3" />Collect
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {participant.is_active && (
              <DropdownMenuItem onClick={onCollect}>
                <IndianRupee className="h-3.5 w-3.5 mr-2" />Collect Payment
              </DropdownMenuItem>
            )}
            {/* ← ADDED: Charge / Waive menu item */}
            {participant.is_active && currentCycle > 0 && (
              <DropdownMenuItem onClick={onChargeWaive}>
                <MinusCircle className="h-3.5 w-3.5 mr-2" />Charge / Waive Cycle
              </DropdownMenuItem>
            )}
            {participant.is_active && (
              <DropdownMenuItem onClick={onEditSlotName}>
                <Pencil className="h-3.5 w-3.5 mr-2" />Edit Slot Name
              </DropdownMenuItem>
            )}
            {participant.user_detail?.id && (
              <DropdownMenuItem onClick={() => router.push(`/admin/users/${participant.user_detail!.id}`)}>
                View User Profile
              </DropdownMenuItem>
            )}
            {canRemove && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={onRemove}
                >
                  <X className="h-3.5 w-3.5 mr-2" />Remove Participant
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}


// ─── Charge / Waive Dialog ────────────────────────────────────────────────────

function ChargeWaiveDialog({ vishiId, participant, currentCycle, onClose }: {
  vishiId:      number
  participant:  VishiParticipantAdmin
  currentCycle: number
  onClose:      () => void
}) {
  const [action,      setAction]      = useState<'charge' | 'waive'>('charge')
  const [cycleNumber, setCycleNumber] = useState(String(currentCycle))
  const [note,        setNote]        = useState('')
  const chargeWaive = useChargeWaive(vishiId, participant.id)

  const handleSubmit = () => {
    const cycle = parseInt(cycleNumber)
    if (!cycle || cycle < 1) return
    chargeWaive.mutate(
      { action, cycle_number: cycle, note: note.trim() || undefined },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Charge / Waive — {participant.vishi_name || participant.user_detail?.username}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('charge')}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                action === 'charge'
                  ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <MinusCircle className="h-4 w-4" /> Charge
            </button>
            <button
              type="button"
              onClick={() => setAction('waive')}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                action === 'waive'
                  ? 'border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <CheckCircle className="h-4 w-4" /> Waive
            </button>
          </div>

          {/* Explanation */}
          <div className={`rounded-lg px-3 py-2.5 text-xs ${
            action === 'charge'
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {action === 'charge'
              ? `Deducts ₹${Number(participant.ledger_balance ?? 0) >= 0 ? '...' : ''} from this participant's balance for the selected cycle. Use for late-added participants who missed auto-charge.`
              : 'Credits the vishi amount back — cancels the charge for this cycle. The participant will not need to pay for this cycle.'
            }
          </div>

          <div className="space-y-1.5">
            <Label>Cycle Number</Label>
            <Input
              type="number" inputMode="numeric" min="1"
              value={cycleNumber}
              onChange={(e) => setCycleNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Current cycle: {currentCycle}</p>
          </div>

          <div className="space-y-1.5">
            <Label>Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              placeholder={action === 'waive' ? 'e.g. Absent this cycle' : 'e.g. Missed auto-charge'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={chargeWaive.isPending}>Cancel</Button>
          <Button
            disabled={chargeWaive.isPending || !cycleNumber || parseInt(cycleNumber) < 1}
            className={action === 'charge' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            onClick={handleSubmit}
          >
            {chargeWaive.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : action === 'charge' ? 'Apply Charge' : 'Waive Cycle'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


// ─── Draw History Row ─────────────────────────────────────────────────────────

function DrawHistoryRow({ record, onRelease }: { record: DrawRecord; onRelease: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold">Cycle {record.cycle_number}</p>
          {record.was_fixed && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 gap-0.5">
              <Lock className="h-2.5 w-2.5" />Fixed
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {record.participant_name} ({record.username}) · {formatDate(record.drawn_at)}
        </p>
        {record.is_released && record.released_amount && (
          <p className="text-xs text-green-600 font-medium mt-0.5">
            {formatCurrency(record.released_amount)} released{record.released_at && ` · ${formatDate(record.released_at)}`}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right space-y-1">
        <Badge variant="outline" className={
          record.is_released
            ? 'text-green-700 bg-green-50 border-green-200 text-xs block'
            : 'text-amber-700 bg-amber-50 border-amber-200 text-xs block'
        }>
          {record.is_released ? 'Released' : 'Pending'}
        </Badge>
        {!record.is_released && (
          <button onClick={onRelease} className="text-xs text-primary underline underline-offset-2 hover:opacity-75">
            Release
          </button>
        )}
      </div>
    </div>
  )
}


function SkipRecordRow({ record }: { record: SkipRecord }) {
  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-muted-foreground">Cycle Skipped</p>
          {record.is_auto && <Badge variant="outline" className="text-xs px-1.5 h-4">Auto</Badge>}
        </div>
        {record.reason && <p className="text-xs text-muted-foreground">{record.reason}</p>}
        <p className="text-xs text-muted-foreground">{formatDate(record.skipped_at)}</p>
      </div>
      <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">Skipped</Badge>
    </div>
  )
}


// ─── Payments Tab ─────────────────────────────────────────────────────────────

function PaymentsTab({ vishiId }: { vishiId: number }) {
  const { data, isLoading } = useLedgers(vishiId)
  const ledgers = data?.results ?? []
  const [collectLedgerId, setCollectLedgerId] = useState<number | null>(null)
  const collectLedger = ledgers.find((l) => l.id === collectLedgerId) ?? null

  if (isLoading) {
    return <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
  }
  if (ledgers.length === 0) {
    return <p className="text-sm text-center text-muted-foreground py-8">No payment ledgers yet.</p>
  }

  return (
    <>
      <Card className="rounded-xl">
        <CardContent className="px-4 py-2 divide-y">
          {ledgers.map((ledger) => {
            const bal    = parseFloat(ledger.balance)
            const balCls = bal < 0 ? 'text-red-500' : bal > 0 ? 'text-blue-500' : 'text-green-600'
            const balText = bal < 0 ? `Owes ₹${Math.abs(bal).toLocaleString('en-IN')}` :
                            bal > 0 ? `Credit ₹${bal.toLocaleString('en-IN')}` : 'Settled'
            return (
              <div key={ledger.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{ledger.participant_name}</p>
                  <p className="text-xs text-muted-foreground">{ledger.mobile_number}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-semibold ${balCls}`}>{balText}</span>
                    <LedgerStatusBadge status={ledger.status} />
                  </div>
                </div>
                {ledger.status === 'due' && (
                  <Button size="sm" variant="default" className="h-7 text-xs gap-0.5 px-2.5 shrink-0" onClick={() => setCollectLedgerId(ledger.id)}>
                    <IndianRupee className="h-3 w-3" />Collect
                  </Button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
      {collectLedger && (
        <CollectFromLedgerDialog vishiId={vishiId} ledger={collectLedger} onClose={() => setCollectLedgerId(null)} />
      )}
    </>
  )
}


// ─── Edit Slot Name Dialog ────────────────────────────────────────────────────

function EditSlotNameDialog({ participant, vishiId, onClose }: {
  participant: VishiParticipantAdmin; vishiId: number; onClose: () => void
}) {
  const [name, setName] = useState(participant.vishi_name || '')
  const update = useUpdateParticipant(vishiId, participant.id)
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Edit Slot Name</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          <Label>Slot Alias</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Raj-Home" autoFocus />
          <p className="text-xs text-muted-foreground">Used to distinguish multiple slots for the same user.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => update.mutate({ vishi_name: name.trim() }, { onSuccess: onClose })} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


// ─── Add Participant Dialog ───────────────────────────────────────────────────

function AddParticipantDialog({ open, onClose, vishiId, isActive, existingParticipants }: {
  open: boolean; onClose: () => void; vishiId: number
  isActive: boolean; existingParticipants: VishiParticipantAdmin[]
}) {
  const [selectedUser, setSelectedUser] = useState('')
  const [slotName,     setSlotName]     = useState('')
  const { data: usersData } = useUsers({ ordering: 'username', is_active: true, page_size: 500 })
  const activeUsers    = usersData?.results ?? []
  const addParticipant = useAddParticipant(vishiId)

  const slotCountForUser = (userId: number) =>
    existingParticipants.filter((p) => p.user_detail?.id === userId).length

  const handleAdd = () => {
    if (!selectedUser) return
    addParticipant.mutate(
      { user: Number(selectedUser), vishi_name: slotName.trim() || undefined },
      { onSuccess: () => { onClose(); setSelectedUser(''); setSlotName('') } }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add Participant</DialogTitle></DialogHeader>
        {isActive && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-700">
            ⚠ Adding to an active vishi — charged from the next draw.
          </div>
        )}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>User *</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger>
              <SelectContent>
                {activeUsers.map((u) => {
                  const existing = slotCountForUser(u.id)
                  return (
                    <SelectItem key={u.id} value={String(u.id)}>
                      <div className="flex flex-col">
                        <span>{u.username || u.mobile_number}</span>
                        <span className="text-xs text-muted-foreground">
                          {u.mobile_number}
                          {existing > 0 && ` · ${existing} slot${existing !== 1 ? 's' : ''} already`}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Slot Alias <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              placeholder="e.g. Raj-Home, Raj-Shop"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
            />
            <p className="text-xs text-muted-foreground">Same user can hold multiple slots.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!selectedUser || addParticipant.isPending} onClick={handleAdd}>
            {addParticipant.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" />Add Slot</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


// ─── Collect from Participant Dialog ─────────────────────────────────────────

function CollectFromParticipantDialog({ vishiId, participant, onClose }: {
  vishiId: number; participant: VishiParticipantAdmin; onClose: () => void
}) {
  const { data } = useLedgers(vishiId)
  const ledger   = data?.results.find((l) => l.participant === participant.id)
  if (!ledger) return null
  return <CollectFromLedgerDialog vishiId={vishiId} ledger={ledger} onClose={onClose} />
}


// ─── Collect from Ledger Dialog ───────────────────────────────────────────────

function CollectFromLedgerDialog({ vishiId, ledger, onClose }: {
  vishiId: number; ledger: CollectionLedger; onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [note,   setNote]   = useState('')
  const record = useRecordPayment(vishiId, ledger.id)

  const balance    = parseFloat(ledger.balance)
  const owes       = balance < 0 ? Math.abs(balance) : 0
  const newBalance = balance + Number(amount || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    record.mutate(
      { amount: Number(amount), note: note.trim() },
      { onSuccess: () => { onClose(); setAmount(''); setNote('') } }
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Collect Payment</DialogTitle></DialogHeader>
        <div className="rounded-lg bg-muted px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participant</span>
            <span className="font-medium">{ledger.participant_name}</span>
          </div>
          {ledger.mobile_number && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mobile</span>
              <span className="font-medium">{ledger.mobile_number}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance</span>
            <span className={`font-semibold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {balance < 0 ? `-₹${Math.abs(balance).toLocaleString('en-IN')}` : `₹${balance.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <LedgerStatusBadge status={ledger.status} />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Amount (₹) *</Label>
            <Input type="number" inputMode="numeric" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus min="1" />
            {owes > 0 && (
              <div className="flex gap-3 flex-wrap pt-0.5">
                {[Math.round(owes / 2), owes].filter((v, i, a) => a.indexOf(v) === i && v > 0).map((amt) => (
                  <button key={amt} type="button" className="text-xs text-primary underline underline-offset-2 hover:opacity-75" onClick={() => setAmount(String(amt))}>
                    ₹{amt.toLocaleString('en-IN')}{amt === owes ? ' (full)' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
          {amount && Number(amount) > 0 && (
            <div className="rounded-lg border px-3 py-2.5 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">New Balance</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${newBalance < 0 ? 'text-red-500' : newBalance > 0 ? 'text-blue-500' : 'text-green-600'}`}>
                    {newBalance === 0 ? '₹0 · Settled' : `${newBalance < 0 ? '-' : '+'}₹${Math.abs(newBalance).toLocaleString('en-IN')}`}
                  </span>
                  <LedgerStatusBadge status={newBalance > 0 ? 'overpaid' : newBalance === 0 ? 'paid' : 'due'} />
                </div>
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Note <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
            <Input placeholder="e.g. Cash collected — 20 Apr" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={record.isPending}>Cancel</Button>
            <Button type="submit" disabled={record.isPending || !amount || Number(amount) <= 0}>
              {record.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
