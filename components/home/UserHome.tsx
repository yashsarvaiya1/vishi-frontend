// components/home/UserHome.tsx
'use client'

import { useRouter }    from 'next/navigation'
import {
  Wallet, AlertCircle, CheckCircle2, ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge }             from '@/components/ui/badge'
import { cn }                from '@/lib/utils'
import {
  LedgerStatusBadge,
  VishiStatusBadge,
  getVishiDisplayStatus,
} from '@/components/shared/StatusBadge'
import EmptyState   from '@/components/shared/EmptyState'
import useAuthStore from '@/stores/authStore'
// FIXED: UserHomeDerived + MyVishiGroup + MyVishiSlot — no UserDashboard/MyDashboardVishi/MyDashboardSlot
import type { UserHomeDerived } from '@/models/dashboard'
import type { MyVishiGroup, MyVishiSlot } from '@/models/dashboard'


interface Props { data: UserHomeDerived }


function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatBal(balance: string) {
  const val = parseFloat(balance)
  const abs = Math.abs(val).toLocaleString('en-IN')
  if (val < 0) return { text: `-₹${abs}`, cls: 'text-red-500'  }
  if (val > 0) return { text: `+₹${abs}`, cls: 'text-blue-500' }
  return       { text: 'Paid',            cls: 'text-green-600' }
}


// ─── Main ─────────────────────────────────────────────────────────────────────


export default function UserHome({ data }: Props) {
  const router   = useRouter()
  const username = useAuthStore((s) => s.username)
  const mobile   = useAuthStore((s) => s.mobile_number)

  const pendingAmt = parseFloat(data.total_pending_balance ?? '0')
  const hasPending = pendingAmt < 0

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          {getGreeting()}, {username || mobile} 👋
        </h2>
      </div>

      {/* 2 Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/5 px-4 py-4 space-y-2">
          <Wallet className="h-4 w-4 text-primary" />
          {/* FIXED: active_vishis_count (not active_vishis) */}
          <p className="text-2xl font-bold leading-none">{data.active_vishis_count}</p>
          <p className="text-xs text-muted-foreground font-medium">Active Vishis</p>
        </div>

        <div className={cn(
          'rounded-xl px-4 py-4 space-y-2',
          hasPending ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
        )}>
          {hasPending
            ? <AlertCircle  className="h-4 w-4 text-red-500" />
            : <CheckCircle2 className="h-4 w-4 text-green-600" />
          }
          <p className={cn(
            'text-xl font-bold leading-none',
            hasPending ? 'text-red-600' : 'text-green-600'
          )}>
            {hasPending ? `₹${Math.abs(pendingAmt).toLocaleString('en-IN')}` : '₹0'}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            {hasPending ? 'Pending Dues' : 'All Clear'}
          </p>
        </div>
      </div>

      {/* My Vishis Summary */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          My Vishis Summary
        </h3>

        {data.my_vishis.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No active vishis"
            description="You are not part of any vishi yet. Contact your admin."
          />
        ) : (
          <div className="space-y-3">
            {data.my_vishis.map((vishi) => (
              <VishiSummaryCard
                key={vishi.vishi_id}
                vishi={vishi}
                onClick={() => router.push(`/common/my-vishis/${vishi.vishi_id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}


// ─── Sub-components ───────────────────────────────────────────────────────────


// FIXED: MyVishiGroup (not MyDashboardVishi)
function VishiSummaryCard({
  vishi, onClick,
}: {
  vishi:   MyVishiGroup
  onClick: () => void
}) {
  const displayStatus = getVishiDisplayStatus(vishi.status)

  // Flow §5.1 — grouped slot names from my_slots[].vishi_name (slot alias)
  // FIXED: s.vishi_name (not s.slot_name) — MyVishiSlot uses vishi_name for slot alias
  const slotNames   = vishi.my_slots.map((s) => s.vishi_name || 'My Slot')
  const slotSummary = slotNames.length === 1
    ? slotNames[0]
    : `${slotNames.join(', ')} (${slotNames.length} participations)`

  // FIXED: total_balance on MyVishiGroup — already computed by backend
  // has_due is also available directly
  const totalBal  = parseFloat(vishi.total_balance)
  const hasDue    = vishi.has_due

  return (
    <Card
      className="rounded-xl cursor-pointer hover:border-primary/50 active:scale-[0.99] transition-all"
      onClick={onClick}
    >
      <CardContent className="px-4 pt-4 pb-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm leading-tight truncate">{vishi.vishi_name}</p>
          <div className="flex items-center gap-1 shrink-0">
            <VishiStatusBadge status={displayStatus} />
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Cycle + slot summary */}
        <p className="text-xs text-muted-foreground">
          Cycle {vishi.current_cycle}/{vishi.total_cycles}
        </p>
        <p className="text-xs text-muted-foreground">
          Your slots: <span className="text-foreground font-medium">{slotSummary}</span>
        </p>

        {/* Total due — use has_due flag from backend */}
        {hasDue && totalBal < 0 && (
          <p className="text-xs font-semibold text-red-500">
            Total Due: ₹{Math.abs(totalBal).toLocaleString('en-IN')} ⚠️ Pending payment
          </p>
        )}

        {/* Individual slot rows */}
        <div className="pt-1 space-y-0">
          {vishi.my_slots.map((slot) => (
            // FIXED: slot.id (not slot.participant_id)
            <SlotRow key={slot.id} slot={slot} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


// FIXED: MyVishiSlot (not MyDashboardSlot)
function SlotRow({ slot }: { slot: MyVishiSlot }) {
  // FIXED: slot.ledger_balance (not slot.balance), slot.ledger_status (not slot.ledger_status was correct but type was wrong)
  const bal = formatBal(slot.ledger_balance ?? '0')

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-t first:border-t-0">
      <div className="min-w-0">
        {/* FIXED: slot.vishi_name (slot alias — not slot.slot_name) */}
        <p className="text-xs font-medium truncate">{slot.vishi_name || 'My Slot'}</p>
        <p className={cn('text-xs font-semibold mt-0.5', bal.cls)}>{bal.text}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {slot.is_drawn && (
          <Badge
            variant="outline"
            className="border-0 text-[10px] px-1.5 h-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          >
            Drawn
          </Badge>
        )}
        {/* FIXED: slot.ledger_status (not slot.ledger_status was right, but null-safe needed) */}
        {slot.ledger_status && <LedgerStatusBadge status={slot.ledger_status} />}
      </div>
    </div>
  )
}
