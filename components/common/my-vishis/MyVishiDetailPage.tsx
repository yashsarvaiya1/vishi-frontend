// components/common/my-vishis/MyVishiDetailPage.tsx
'use client'

import { useState, useEffect }  from 'react'
import { useVishi }             from '@/hooks/useVishis'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Card, CardContent }    from '@/components/ui/card'
import { Separator }            from '@/components/ui/separator'
import { Badge }                from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Lock, ArrowDownCircle, ArrowUpCircle,
  Trophy, Clock,
} from 'lucide-react'
import {
  VishiStatusBadge,
  ParticipantStatusBadge,
  getVishiDisplayStatus,
} from '@/components/shared/StatusBadge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import PageHeader     from '@/components/shared/PageHeader'
import DrawAnimation  from '@/components/shared/DrawAnimation'
import useUIStore     from '@/stores/uiStore'
import useAuthStore   from '@/stores/authStore'
import type {
  VishiPublic,
  VishiParticipantPublic,
  DrawRecordPublic,
} from '@/models/vishi'

export default function MyVishiDetailPage({ id }: { id: number }) {
  const { data, isLoading } = useVishi(id)
  const vishi               = data as VishiPublic | undefined
  const myMobile            = useAuthStore((s) => s.mobile_number)

  const hasSeenDraw = useUIStore((s) => s.hasSeenDraw)
  const [showAnim,    setShowAnim]    = useState(false)
  const [animChecked, setAnimChecked] = useState(false)

  // Flow §5.2 — trigger draw animation on first view after a new draw
  useEffect(() => {
    if (!vishi || animChecked) return
    setAnimChecked(true)
    const latest = vishi.draw_records[vishi.draw_records.length - 1]
    if (latest && !hasSeenDraw(vishi.id, latest.cycle_number)) {
      setShowAnim(true)
    }
  }, [vishi, hasSeenDraw, animChecked])

  if (isLoading) return <LoadingSpinner fullPage label="Loading vishi..." />
  if (!vishi)    return <p className="text-center text-muted-foreground py-12">Vishi not found.</p>

  const latestDraw  = vishi.draw_records[vishi.draw_records.length - 1]
  const activeCount = vishi.participants.filter((p) => p.is_active).length
  const drawnCount  = vishi.participants.filter((p) => p.is_drawn).length
  const remaining   = activeCount - drawnCount
  const displayStatus = getVishiDisplayStatus(vishi.status)

  // Identify current user's own slots (public view — matched by username heuristic;
  // backend vishi_name is slot-specific so we check all participants)
  // For the "My Slots" tab we show all participants — backend already filters
  // to the authenticated user's public view via VishiParticipantPublic serializer.
  // We split: my slots = those whose username matches store, rest = others.
  // Note: VishiParticipantPublic doesn't have a user_id, so we match by username
  // from the store as a best-effort heuristic. Full ledger data is on admin view only.
  const storeUsername = useAuthStore.getState().username
  const mySlots  = vishi.participants.filter(
    (p) => p.username === storeUsername && p.is_active
  )
  const allParticipants = vishi.participants

  return (
    <>
      {/* One-time draw animation — flow §5.2 */}
      {showAnim && latestDraw && (
        <DrawAnimation
          vishiId    ={vishi.id}
          cycleNumber={latestDraw.cycle_number}
          winnerName ={latestDraw.vishi_name}
          username   ={latestDraw.username}
          amount     ={latestDraw.released_amount ?? vishi.amount}
          wasFixed   ={latestDraw.was_fixed}
          onDone     ={() => setShowAnim(false)}
        />
      )}

      <div className="space-y-5">
        <PageHeader back title={vishi.name} subtitle={formatFrequency(vishi.frequency)} />

        {/* Status + amount banner */}
        <Card className="rounded-xl bg-primary/5 border-primary/10">
          <CardContent className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Amount per cycle</p>
                <p className="text-2xl font-bold">{formatCurrency(vishi.amount)}</p>
              </div>
              <VishiStatusBadge status={displayStatus} />
            </div>
            <Separator className="my-3" />
            {/* Flow §5.2 — timeline progress */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{vishi.current_cycle}</p>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <div>
                <p className="text-lg font-bold">{vishi.total_cycles}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-lg font-bold">{remaining}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming dates */}
        <Card className="rounded-xl">
          <CardContent className="px-4 py-4">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
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

        {/*
         * Flow §5.2 — 3 tabs: My Slots · All Participants · Draw History
         * Tab layout is core to the user detail view per the flow doc.
         */}
        <Tabs defaultValue="my-slots">
          <TabsList className="w-full">
            <TabsTrigger value="my-slots"      className="flex-1">My Slots</TabsTrigger>
            <TabsTrigger value="participants"  className="flex-1">Participants</TabsTrigger>
            <TabsTrigger value="draw-history"  className="flex-1">Draw History</TabsTrigger>
          </TabsList>

          {/* ── TAB 1: My Slots ── */}
          <TabsContent value="my-slots" className="mt-3 space-y-3">
            {mySlots.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">
                You don't have any active slots in this vishi.
              </p>
            ) : (
              mySlots.map((slot) => (
                <MySlotCard key={slot.id} slot={slot} drawRecords={vishi.draw_records} />
              ))
            )}
          </TabsContent>

          {/* ── TAB 2: All Participants ── */}
          {/*
           * Flow §5.2 — All Participants tab:
           * Shows IN POOL (remaining) and WINNERS (drawn) sections.
           * Mobile number, address, payment amounts are hidden for non-admins.
           */}
          <TabsContent value="participants" className="mt-3">
            <Card className="rounded-xl">
              <CardContent className="px-4 pb-4 pt-3 space-y-3">
                {/* In pool */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    In Pool ({remaining} remaining)
                  </p>
                  <div className="divide-y">
                    {allParticipants
                      .filter((p) => p.is_active && !p.is_drawn)
                      .map((p) => (
                        <PublicParticipantRow key={p.id} participant={p} />
                      ))}
                    {allParticipants.filter((p) => p.is_active && !p.is_drawn).length === 0 && (
                      <p className="text-xs text-muted-foreground py-3">
                        All participants have been drawn.
                      </p>
                    )}
                  </div>
                </div>

                {drawnCount > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        Winners ({drawnCount} drawn)
                      </p>
                      <div className="divide-y">
                        {allParticipants
                          .filter((p) => p.is_drawn)
                          .map((p) => {
                            const record = vishi.draw_records.find(
                              (r) => r.vishi_name === p.vishi_name
                            )
                            return (
                              <PublicParticipantRow
                                key={p.id}
                                participant={p}
                                drawRecord={record}
                              />
                            )
                          })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 3: Draw History ── */}
          {/*
           * Flow §5.2 — Draw History tab:
           * All draw records visible to everyone — no sensitive data.
           * Pending cycle shown as "Draw pending" row.
           */}
          <TabsContent value="draw-history" className="mt-3">
            <Card className="rounded-xl">
              <CardContent className="px-4 pb-4 pt-3 divide-y">
                {/* Show each cycle 1..total_cycles */}
                {Array.from({ length: vishi.total_cycles }, (_, i) => i + 1).map((cycle) => {
                  const record = vishi.draw_records.find((r) => r.cycle_number === cycle)
                  if (record) {
                    return <DrawHistoryRow key={cycle} record={record} />
                  }
                  // Upcoming / pending cycle
                  const isCurrent = cycle === vishi.current_cycle + 1 || (vishi.current_cycle === 0 && cycle === 1)
                  return (
                    <div key={cycle} className="flex items-center justify-between py-2.5 gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">
                          Cycle {cycle}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground gap-1 flex items-center"
                      >
                        <Clock className="h-3 w-3" />
                        {isCurrent ? 'Draw pending' : 'Upcoming'}
                      </Badge>
                    </div>
                  )
                })}

                {vishi.draw_records.length === 0 && vishi.total_cycles === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-6">
                    No draws yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

// ─── My Slot Card (Tab 1) ─────────────────────────────────────────────────────
// Flow §5.2 — My Slots tab: shows slot name, draw status, payment history
// Public view — no ledger balance (admin only). Shows draw win info if drawn.

function MySlotCard({
  slot, drawRecords,
}: {
  slot:        VishiParticipantPublic
  drawRecords: DrawRecordPublic[]
}) {
  const winRecord = drawRecords.find((r) => r.vishi_name === slot.vishi_name)

  return (
    <Card className="rounded-xl">
      <CardContent className="px-4 py-4 space-y-3">
        {/* Slot header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{slot.vishi_name || slot.username}</p>
            {slot.vishi_name && (
              <p className="text-xs text-muted-foreground">{slot.username}</p>
            )}
          </div>
          <ParticipantStatusBadge
            is_drawn={slot.is_drawn}
            is_active={slot.is_active}
            was_fixed={winRecord?.was_fixed}
          />
        </div>

        {/* Win details if drawn */}
        {slot.is_drawn && winRecord && (
          <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 px-3 py-2.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                Won Cycle {winRecord.cycle_number}
              </p>
              {winRecord.was_fixed && (
                <Badge variant="outline" className="text-[10px] px-1.5 h-4 gap-0.5">
                  <Lock className="h-2.5 w-2.5" />Fixed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Drawn: {formatDate(winRecord.drawn_at)}
            </p>
            {winRecord.is_released && winRecord.released_amount && (
              <p className="text-xs font-semibold text-green-600">
                Released: ₹{Number(winRecord.released_amount).toLocaleString('en-IN')}
                {winRecord.released_at && ` on ${formatDate(winRecord.released_at)}`}
              </p>
            )}
            {!winRecord.is_released && (
              <p className="text-xs text-amber-600 font-medium">Release pending</p>
            )}
          </div>
        )}

        {/* Draw date if still in pool */}
        {!slot.is_drawn && slot.drawn_at && (
          <p className="text-xs text-muted-foreground">
            Drawn: {formatDate(slot.drawn_at)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Public Participant Row (Tab 2) ───────────────────────────────────────────
// Flow §5.2 — mobile number, address, payment amounts hidden for non-admins

function PublicParticipantRow({
  participant, drawRecord,
}: {
  participant: VishiParticipantPublic
  drawRecord?: DrawRecordPublic
}) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">
          {participant.vishi_name || participant.username}
        </p>
        {participant.vishi_name && (
          <p className="text-xs text-muted-foreground">{participant.username}</p>
        )}
        {participant.is_drawn && drawRecord?.drawn_at && (
          <p className="text-xs text-muted-foreground">
            Won: {formatDate(drawRecord.drawn_at)}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right space-y-0.5">
        <ParticipantStatusBadge
          is_drawn={participant.is_drawn}
          is_active={participant.is_active}
          was_fixed={drawRecord?.was_fixed}
        />
        {participant.is_drawn && drawRecord?.released_amount && (
          <p className="text-xs text-green-600 font-medium">
            ₹{Number(drawRecord.released_amount).toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Draw History Row (Tab 3) ─────────────────────────────────────────────────

function DrawHistoryRow({ record }: { record: DrawRecordPublic }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold">
            Cycle {record.cycle_number}
          </p>
          {record.was_fixed && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 gap-0.5">
              <Lock className="h-2.5 w-2.5" />Fixed
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {record.vishi_name} ({record.username}) · {formatDate(record.drawn_at)}
        </p>
        {record.is_released && record.released_amount && (
          <p className="text-xs font-medium text-green-600 mt-0.5">
            ₹{Number(record.released_amount).toLocaleString('en-IN')} released
            {record.released_at && ` · ${formatDate(record.released_at)}`}
          </p>
        )}
      </div>
      <Badge
        variant="outline"
        className={
          record.is_released
            ? 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 text-xs shrink-0'
            : 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 text-xs shrink-0'
        }
      >
        {record.is_released ? 'Released' : 'Pending'}
      </Badge>
    </div>
  )
}
