'use client'

import { useRouter }   from 'next/navigation'
import { useMyVishis } from '@/hooks/useDashboard'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton }          from '@/components/ui/skeleton'
import { Badge }             from '@/components/ui/badge'
import { ChevronRight, Wallet } from 'lucide-react'
import {
  VishiStatusBadge, LedgerStatusBadge, getVishiDisplayStatus,
} from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/shared/PageHeader'
import type { MyVishiGroup, MyVishiSlot } from '@/models/dashboard'


export default function MyVishisPage() {
  const router              = useRouter()
  const { data, isLoading } = useMyVishis()

  // FIXED: backend returns plain array — not paginated { count, results }
  const vishis: MyVishiGroup[] = Array.isArray(data) ? data : []

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Vishis"
        subtitle={!isLoading ? `${vishis.length} total` : undefined}
      />

      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
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

  return (
    <Card
      className="rounded-xl cursor-pointer hover:border-primary/50 active:scale-[0.99] transition-all group"
      onClick={onClick}
    >
      <CardContent className="px-4 pt-4 pb-3 space-y-2">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm leading-tight truncate flex-1">
            {vishi.vishi_name}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <VishiStatusBadge status={displayStatus} />
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Meta */}
        <p className="text-xs text-muted-foreground">
          {formatCurrency(vishi.amount)} · {formatFrequency(vishi.frequency)} ·
          Cycle {vishi.current_cycle}/{vishi.total_cycles}
        </p>

        <p className="text-xs text-muted-foreground">
          Draw: <span className="font-medium">{formatDate(vishi.current_draw_date)}</span>
        </p>

        {/* My slots */}
        <div className="pt-1 border-t">
          {vishi.my_slots.map((slot) => (
            // FIXED: key is slot.id not slot.participant_id
            <SlotRow key={slot.id} slot={slot} />
          ))}
        </div>

      </CardContent>
    </Card>
  )
}


function SlotRow({ slot }: { slot: MyVishiSlot }) {
  // FIXED: field is ledger_balance not balance
  const bal = parseFloat(slot.ledger_balance ?? '0')
  const balCls =
    bal < 0 ? 'text-red-500' :
    bal > 0 ? 'text-blue-500' :
              'text-green-600'
  const balText =
    bal < 0 ? `-₹${Math.abs(bal).toLocaleString('en-IN')}` :
    bal > 0 ? `+₹${bal.toLocaleString('en-IN')}` :
              'Paid'

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-t first:border-t-0">
      <div className="min-w-0">
        {/* FIXED: field is vishi_name not slot_name */}
        <p className="text-xs font-medium truncate">{slot.vishi_name || 'My Slot'}</p>
        {slot.is_drawn && (
          <Badge variant="outline" className="mt-0.5 border-0 text-[10px] px-1.5 h-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {/* FIXED: cycle number is nested in draw_record not draw_cycle */}
            {slot.draw_record?.cycle_number
              ? `Won Cycle ${slot.draw_record.cycle_number}`
              : 'Drawn'
            }
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`text-xs font-semibold ${balCls}`}>{balText}</span>
        {/* FIXED: ledger_status can be null — guard it */}
        {slot.ledger_status && <LedgerStatusBadge status={slot.ledger_status} />}
      </div>
    </div>
  )
}
