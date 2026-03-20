// components/common/my-vishis/MyVishiDetailPage.tsx
'use client'

import { useState, useEffect }  from 'react'
import { useVishi }             from '@/hooks/useVishis'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Card, CardContent }    from '@/components/ui/card'
import { Separator }            from '@/components/ui/separator'
import { Badge }                from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, Trophy, Clock, CalendarDays } from 'lucide-react'
import {
  VishiStatusBadge, ParticipantStatusBadge, getVishiDisplayStatus,
} from '@/components/shared/StatusBadge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import PageHeader     from '@/components/shared/PageHeader'
import DrawAnimation  from '@/components/shared/DrawAnimation'
import useUIStore     from '@/stores/uiStore'
import useAuthStore   from '@/stores/authStore'
import type { VishiPublic, VishiParticipantPublic, DrawRecordPublic } from '@/models/vishi'

export default function MyVishiDetailPage({ id }: { id: number }) {
  const { data, isLoading } = useVishi(id)
  const vishi = data as VishiPublic | undefined

  // ← ALL hooks before any conditional returns
  const hasSeenDraw  = useUIStore((s) => s.hasSeenDraw)
  const storeUserId  = useAuthStore((s) => s.user_id)      // ← moved up
  const storeUsername = useAuthStore((s) => s.username)    // ← moved up

  const [showAnim,    setShowAnim]    = useState(false)
  const [animChecked, setAnimChecked] = useState(false)

  useEffect(() => {
    if (!vishi || animChecked) return
    setAnimChecked(true)
    const latest = vishi.draw_records[vishi.draw_records.length - 1]
    if (latest && !hasSeenDraw(vishi.id, latest.cycle_number)) {
      setShowAnim(true)
    }
  }, [vishi, hasSeenDraw, animChecked])

  // ← conditional returns AFTER all hooks
  if (isLoading) return <LoadingSpinner fullPage label="Loading vishi..." />
  if (!vishi)    return <p className="text-center text-muted-foreground py-16">Vishi not found.</p>

  const latestDraw    = vishi.draw_records[vishi.draw_records.length - 1]
  const activeCount   = vishi.participants.filter((p) => p.is_active).length
  const drawnCount    = vishi.participants.filter((p) => p.is_drawn).length
  const remaining     = activeCount - drawnCount
  const displayStatus = getVishiDisplayStatus(vishi.status)
  const progress      = vishi.total_cycles > 0 ? (vishi.current_cycle / vishi.total_cycles) * 100 : 0

  // Admin gets VishiSerializer → participants have user_detail.id
  // Regular user gets VishiPublicSerializer → participants have user_id
  const mySlots = (vishi.participants as any[]).filter((p) => {
    if (!p.is_active) return false
    if (storeUserId) {
      if (p.user_detail?.id)  return p.user_detail.id === storeUserId
      if (p.user_id != null)  return p.user_id === storeUserId
    }
    // fallback: match by username
    if (storeUsername && p.username) return p.username === storeUsername
    return false
  })

  return (
    <>
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

      <div className="space-y-4">
        <PageHeader back title={vishi.name} subtitle={formatFrequency(vishi.frequency)} />

        {/* Hero banner */}
        <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="px-5 py-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Amount per cycle</p>
                <p className="text-3xl font-black mt-0.5">{formatCurrency(vishi.amount)}</p>
              </div>
              <VishiStatusBadge status={displayStatus} />
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-medium">Cycle {vishi.current_cycle} of {vishi.total_cycles}</span>
                <span>{remaining} remaining</span>
              </div>
              <div className="h-2 bg-background/60 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Current',   value: vishi.current_cycle },
                { label: 'Total',     value: vishi.total_cycles  },
                { label: 'Remaining', value: remaining            },
              ].map(({ label, value }) => (
                <div key={label} className="bg-background/60 rounded-xl py-2.5 px-1">
                  <p className="text-xl font-black">{value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="rounded-2xl">
          <CardContent className="px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Schedule</p>
            </div>
            <div className="grid grid-cols-2 gap-y-3">
              {[
                ['Draw',       vishi.current_draw_date],
                ['Collection', vishi.current_collection_date],
                ['Release',    vishi.current_release_date],
                ['Start',      vishi.start_date],
                ['Finish',     vishi.finish_date],
              ].map(([label, value]) => (
                <div key={label} className="contents">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className="font-semibold text-sm">{formatDate(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="my-slots">
          <TabsList className="w-full rounded-xl h-10">
            <TabsTrigger value="my-slots"     className="flex-1 rounded-lg text-xs">My Slots</TabsTrigger>
            <TabsTrigger value="participants" className="flex-1 rounded-lg text-xs">Participants</TabsTrigger>
            <TabsTrigger value="draw-history" className="flex-1 rounded-lg text-xs">Draws</TabsTrigger>
          </TabsList>

          {/* My Slots */}
          <TabsContent value="my-slots" className="mt-3 space-y-3">
            {mySlots.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No active slots in this vishi.</p>
                  <p className="text-xs text-muted-foreground mt-1 opacity-60">
                    Ask the admin to add you as a participant.
                  </p>
                </CardContent>
              </Card>
            ) : (
              mySlots.map((slot: any) => (
                <MySlotCard key={slot.id} slot={slot} drawRecords={vishi.draw_records} />
              ))
            )}
          </TabsContent>

          {/* Participants */}
          <TabsContent value="participants" className="mt-3">
            <Card className="rounded-2xl">
              <CardContent className="px-4 pb-4 pt-4 space-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    In Pool — {remaining} remaining
                  </p>
                  <div className="divide-y">
                    {vishi.participants.filter((p) => p.is_active && !p.is_drawn).map((p) => (
                      <PublicParticipantRow key={p.id} participant={p} />
                    ))}
                    {remaining === 0 && (
                      <p className="text-xs text-muted-foreground py-3">All drawn.</p>
                    )}
                  </div>
                </div>
                {drawnCount > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Winners — {drawnCount} drawn
                      </p>
                      <div className="divide-y">
                        {vishi.participants.filter((p) => p.is_drawn).map((p) => {
                          const record = vishi.draw_records.find((r) => r.vishi_name === p.vishi_name)
                          return <PublicParticipantRow key={p.id} participant={p} drawRecord={record} />
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Draw History */}
          <TabsContent value="draw-history" className="mt-3">
            <Card className="rounded-2xl">
              <CardContent className="px-4 pb-4 pt-4 divide-y">
                {Array.from({ length: vishi.total_cycles }, (_, i) => i + 1).map((cycle) => {
                  const record    = vishi.draw_records.find((r) => r.cycle_number === cycle)
                  const isCurrent = cycle === vishi.current_cycle + 1
                  if (record) return <DrawHistoryRow key={cycle} record={record} />
                  return (
                    <div key={cycle} className="flex items-center justify-between py-3 gap-3">
                      <p className="text-sm text-muted-foreground">Cycle {cycle}</p>
                      <Badge variant="outline" className="text-[11px] rounded-full border-0 bg-muted text-muted-foreground gap-1">
                        <Clock className="h-3 w-3" />
                        {isCurrent ? 'Pending' : 'Upcoming'}
                      </Badge>
                    </div>
                  )
                })}
                {vishi.draw_records.length === 0 && vishi.total_cycles === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-6">No draws yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function MySlotCard({ slot, drawRecords }: {
  slot: any; drawRecords: DrawRecordPublic[]
}) {
  const slotName    = slot.vishi_name
  const displayName = slot.user_detail?.username || slot.username || ''
  const winRecord   = drawRecords.find((r) => r.vishi_name === slotName)

  return (
    <Card className="rounded-2xl">
      <CardContent className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-bold text-sm">{slotName || displayName}</p>
            {slotName && <p className="text-xs text-muted-foreground">{displayName}</p>}
          </div>
          <ParticipantStatusBadge is_drawn={slot.is_drawn} is_active={slot.is_active} was_fixed={winRecord?.was_fixed} />
        </div>
        {slot.is_drawn && winRecord && (
          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800 px-3 py-3 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              <p className="text-xs font-bold text-violet-700 dark:text-violet-300">Won Cycle {winRecord.cycle_number}</p>
              {winRecord.was_fixed && (
                <Badge variant="outline" className="text-[10px] px-1.5 h-4 gap-0.5 rounded-full border-0 bg-amber-100 text-amber-700">
                  <Lock className="h-2.5 w-2.5" />Fixed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Drawn: {formatDate(winRecord.drawn_at)}</p>
            {winRecord.is_released && winRecord.released_amount && (
              <p className="text-xs font-bold text-emerald-600">
                ₹{Number(winRecord.released_amount).toLocaleString('en-IN')} released
                {winRecord.released_at && ` · ${formatDate(winRecord.released_at)}`}
              </p>
            )}
            {!winRecord.is_released && (
              <p className="text-xs text-amber-600 font-semibold">⏳ Release pending</p>
            )}
          </div>
        )}
        {slot.ledger_balance !== undefined && (
          <div className="flex items-center justify-between text-xs pt-1 border-t">
            <span className="text-muted-foreground">Balance</span>
            <span className={`font-bold ${
              parseFloat(slot.ledger_balance) < 0 ? 'text-rose-600' :
              parseFloat(slot.ledger_balance) > 0 ? 'text-sky-600' : 'text-emerald-600'
            }`}>
              {parseFloat(slot.ledger_balance) === 0
                ? 'Paid'
                : `${parseFloat(slot.ledger_balance) < 0 ? '-' : '+'}₹${Math.abs(parseFloat(slot.ledger_balance)).toLocaleString('en-IN')}`
              }
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PublicParticipantRow({ participant, drawRecord }: {
  participant: VishiParticipantPublic; drawRecord?: DrawRecordPublic
}) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{participant.vishi_name || participant.username}</p>
        {participant.vishi_name && <p className="text-xs text-muted-foreground">{participant.username}</p>}
        {participant.is_drawn && drawRecord?.drawn_at && (
          <p className="text-xs text-muted-foreground">Won: {formatDate(drawRecord.drawn_at)}</p>
        )}
      </div>
      <div className="shrink-0 text-right space-y-0.5">
        <ParticipantStatusBadge is_drawn={participant.is_drawn} is_active={participant.is_active} was_fixed={drawRecord?.was_fixed} />
        {participant.is_drawn && drawRecord?.released_amount && (
          <p className="text-xs text-emerald-600 font-bold">₹{Number(drawRecord.released_amount).toLocaleString('en-IN')}</p>
        )}
      </div>
    </div>
  )
}

function DrawHistoryRow({ record }: { record: DrawRecordPublic }) {
  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-bold">Cycle {record.cycle_number}</p>
          {record.was_fixed && (
            <Badge variant="outline" className="text-[10px] px-1.5 h-4 gap-0.5 rounded-full border-0 bg-amber-100 text-amber-700">
              <Lock className="h-2.5 w-2.5" />Fixed
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {record.vishi_name} ({record.username}) · {formatDate(record.drawn_at)}
        </p>
        {record.is_released && record.released_amount && (
          <p className="text-xs font-bold text-emerald-600 mt-0.5">
            ₹{Number(record.released_amount).toLocaleString('en-IN')} released
            {record.released_at && ` · ${formatDate(record.released_at)}`}
          </p>
        )}
      </div>
      <Badge variant="outline" className={
        record.is_released
          ? 'border-0 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0'
          : 'border-0 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0'
      }>
        {record.is_released ? '✓ Released' : '⏳ Pending'}
      </Badge>
    </div>
  )
}
