// components/common/my-vishis/MyVishisPage.tsx
'use client'

import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import { useMyVishis } from '@/hooks/useDashboard'
import { formatCurrency, formatDate, formatFrequency,cn } from '@/lib/utils'
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

type Filter = 'active' | 'completed'

export default function MyVishisPage() {
  const router              = useRouter()
  const { data, isLoading } = useMyVishis()
  const vishis: MyVishiGroup[] = Array.isArray(data) ? data : []
  const [filter, setFilter] = useState<Filter>('active')

  const activeVishis    = vishis.filter((v) => v.status !== 'completed')
  const completedVishis = vishis.filter((v) => v.status === 'completed')
  const dueCount        = activeVishis.filter((v) => v.has_due).length
  const displayed       = filter === 'active' ? activeVishis : completedVishis

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
            {activeVishis.length} active
          </div>
          {dueCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-full px-3 py-1.5 text-xs font-semibold">
              ⚠ {dueCount} with pending dues
            </div>
          )}
          {completedVishis.length > 0 && (
            <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full px-3 py-1.5 text-xs font-semibold">
              ✓ {completedVishis.length} completed
            </div>
          )}
        </div>
      )}

      {/* Filter pills — only show if there are completed vishis */}
      {!isLoading && completedVishis.length > 0 && (
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === 'active'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Active
            {activeVishis.length > 0 && (
              <span className="ml-1 opacity-70">{activeVishis.length}</span>
            )}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === 'completed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Completed
            <span className="ml-1 opacity-70">{completedVishis.length}</span>
          </button>
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
        ) : displayed.length === 0 ? (
          <div className="rounded-2xl bg-muted/40 px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">No {filter} vishis.</p>
          </div>
        ) : (
          displayed.map((vishi) => (
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
  const isCompleted   = vishi.status === 'completed'
  const balCls        = totalBal < 0 ? 'text-rose-600' : totalBal > 0 ? 'text-sky-600' : 'text-emerald-600'
  const balText       = totalBal < 0
    ? `-₹${Math.abs(totalBal).toLocaleString('en-IN')}`
    : totalBal > 0
    ? `+₹${totalBal.toLocaleString('en-IN')}`
    : 'All paid'

  return (
    <Card
      className={cn(
        'rounded-2xl cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-[0.99] transition-all duration-150 group',
        isCompleted && 'opacity-80'
      )}
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

        {/* Progress + balance */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Cycle {vishi.current_cycle}/{vishi.total_cycles}</span>
              {!isCompleted && <span>Draw {formatDate(vishi.current_draw_date)}</span>}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', isCompleted ? 'bg-teal-500' : 'bg-primary')}
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
