// components/common/my-vishis/MyVishisPage.tsx
'use client'

import { useRouter }   from 'next/navigation'
import { useMyVishis } from '@/hooks/useDashboard'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton }          from '@/components/ui/skeleton'
import { Badge }             from '@/components/ui/badge'
import { ChevronRight, Wallet, TrendingUp } from 'lucide-react'
import {
  VishiStatusBadge, LedgerStatusBadge, getVishiDisplayStatus,
} from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/shared/PageHeader'
import type { MyVishiGroup, MyVishiSlot } from '@/models/dashboard'


export default function MyVishisPage() {
  const router              = useRouter()
  const { data, isLoading } = useMyVishis()
  const vishis: MyVishiGroup[] = Array.isArray(data) ? data : []

  const activeCount = vishis.filter((v) => v.status === 'active').length
  const dueCount    = vishis.filter((v) => v.has_due).length

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Vishis"
        subtitle={!isLoading ? `${vishis.length} vishi${vishis.length !== 1 ? 's' : ''}` : undefined}
      />

      {/* Summary chips */}
      {!isLoading && vishis.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full px-3 py-1.5 text-xs font-semibold">
            <TrendingUp className="h-3 w-3" />
            {activeCount} active
          </div>
          {dueCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-full px-3 py-1.5 text-xs font-semibold">
              ⚠ {dueCount} with pending dues
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))
        ) : vishis.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No vishis yet"
            description="You are not part of any vishi yet. Contact your admin to be added."
          />
        ) : (
          vishis.map((vishi) => (
            <VishiGroupCard
              key={vishi.vishi_id}
              vishi={vishi}
              onClick={() => router.push(`/common/my-vishis/${vishi.vishi_id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}


function VishiGroupCard({ vishi, onClick }: { vishi: MyVishiGroup; onClick: () => void }) {
  const displayStatus = getVishiDisplayStatus(vishi.status)
  const totalBal      = parseFloat(vishi.total_balance)
  const balCls        = totalBal < 0 ? 'text-rose-600' : totalBal > 0 ? 'text-sky-600' : 'text-emerald-600'
  const balText       = totalBal < 0
    ? `-₹${Math.abs(totalBal).toLocaleString('en-IN')}`
    : totalBal > 0
    ? `+₹${totalBal.toLocaleString('en-IN')}`
    : 'All paid'

  return (
    <Card
      className="rounded-2xl cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-[0.99] transition-all duration-150 group"
      onClick={onClick}
    >
      <CardContent className="px-4 pt-4 pb-3 space-y-3">

        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm leading-tight truncate">{vishi.vishi_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(vishi.amount)} · {formatFrequency(vishi.frequency)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <VishiStatusBadge status={displayStatus} />
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Progress + balance row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Cycle {vishi.current_cycle}/{vishi.total_cycles}</span>
              <span>Draw {formatDate(vishi.current_draw_date)}</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${vishi.total_cycles > 0 ? (vishi.current_cycle / vishi.total_cycles) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${balCls}`}>{balText}</p>
          </div>
        </div>

        {/* Slot rows */}
        {vishi.my_slots.length > 0 && (
          <div className="border-t pt-2 space-y-0">
            {vishi.my_slots.map((slot) => (
              <SlotRow key={slot.id} slot={slot} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


function SlotRow({ slot }: { slot: MyVishiSlot }) {
  const bal    = parseFloat(slot.ledger_balance ?? '0')
  const balCls = bal < 0 ? 'text-rose-600' : bal > 0 ? 'text-sky-600' : 'text-emerald-600'
  const balText = bal < 0
    ? `-₹${Math.abs(bal).toLocaleString('en-IN')}`
    : bal > 0
    ? `+₹${bal.toLocaleString('en-IN')}`
    : 'Paid'

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-t first:border-t-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{slot.vishi_name || 'My Slot'}</p>
        {slot.is_drawn && (
          <Badge
            variant="outline"
            className="mt-0.5 border-0 text-[10px] px-1.5 h-4 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 rounded-full font-semibold"
          >
            {slot.draw_record?.cycle_number ? `★ Won Cycle ${slot.draw_record.cycle_number}` : '★ Won'}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`text-xs font-bold ${balCls}`}>{balText}</span>
        {slot.ledger_status && <LedgerStatusBadge status={slot.ledger_status} />}
      </div>
    </div>
  )
}
