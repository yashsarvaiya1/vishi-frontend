// components/home/UserHome.tsx
'use client'

import { useState }     from 'react'
import { useRouter }    from 'next/navigation'
import {
  Wallet, AlertCircle, CheckCircle2, ChevronRight, TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge }             from '@/components/ui/badge'
import { cn }                from '@/lib/utils'
import {
  LedgerStatusBadge, VishiStatusBadge, getVishiDisplayStatus,
} from '@/components/shared/StatusBadge'
import EmptyState   from '@/components/shared/EmptyState'
import useAuthStore from '@/stores/authStore'
import type { UserHomeDerived, MyVishiGroup, MyVishiSlot } from '@/models/dashboard'

interface Props { data: UserHomeDerived }

type Filter = 'active' | 'completed'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function UserHome({ data }: Props) {
  const router   = useRouter()
  const username = useAuthStore((s) => s.username)
  const mobile   = useAuthStore((s) => s.mobile_number)
  const [filter, setFilter] = useState<Filter>('active')

  const pendingAmt = parseFloat(data.total_pending_balance ?? '0')
  const hasPending = pendingAmt < 0
  const today      = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  const activeVishis    = data.my_vishis.filter((v) => v.status !== 'completed')
  const completedVishis = data.my_vishis.filter((v) => v.status === 'completed')
  const displayed       = filter === 'active' ? activeVishis : completedVishis

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <p className="text-xs text-muted-foreground font-medium">{today}</p>
        <h2 className="text-2xl font-black tracking-tight mt-0.5">
          {getGreeting()}, {username || mobile} 👋
        </h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-linear-to-br from-primary/8 to-violet-50 dark:from-primary/15 dark:to-violet-900/20 px-4 py-4 space-y-3">
          <div className="h-8 w-8 rounded-xl bg-background/60 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-black leading-none">{data.active_vishis_count}</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">Active Vishis</p>
          </div>
        </div>

        <div className={cn(
          'rounded-2xl px-4 py-4 space-y-3 bg-linear-to-br',
          hasPending
            ? 'from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20'
            : 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
        )}>
          <div className="h-8 w-8 rounded-xl bg-background/60 flex items-center justify-center">
            {hasPending
              ? <AlertCircle  className="h-4 w-4 text-rose-500" />
              : <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            }
          </div>
          <div>
            <p className={cn('text-2xl font-black leading-none', hasPending ? 'text-rose-600' : 'text-emerald-600')}>
              {hasPending ? `₹${Math.abs(pendingAmt).toLocaleString('en-IN')}` : '₹0'}
            </p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              {hasPending ? 'Pending Dues' : 'All Clear'}
            </p>
          </div>
        </div>
      </div>

      {/* My Vishis */}
      <section className="space-y-3">
        {/* Header + filter pills */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            My Vishis
          </h3>
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
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
            {completedVishis.length > 0 && (
              <button
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  filter === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Completed
                <span className="ml-1 opacity-70">{completedVishis.length}</span>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {data.my_vishis.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No vishis yet"
            description="You are not part of any vishi yet. Contact your admin."
          />
        ) : displayed.length === 0 ? (
          <div className="rounded-2xl bg-muted/40 px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No {filter} vishis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((vishi) => (
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

function VishiSummaryCard({ vishi, onClick }: { vishi: MyVishiGroup; onClick: () => void }) {
  const displayStatus = getVishiDisplayStatus(vishi.status)
  const totalBal      = parseFloat(vishi.total_balance)
  const balCls        = totalBal < 0 ? 'text-rose-600' : totalBal > 0 ? 'text-sky-600' : 'text-emerald-600'
  const balText       = totalBal < 0
    ? `-₹${Math.abs(totalBal).toLocaleString('en-IN')}`
    : totalBal > 0
    ? `+₹${totalBal.toLocaleString('en-IN')}`
    : 'All paid'
  const progress = vishi.total_cycles > 0 ? (vishi.current_cycle / vishi.total_cycles) * 100 : 0
  const isCompleted = vishi.status === 'completed'

  return (
    <Card
      className={cn(
        'rounded-2xl cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-[0.99] transition-all duration-150 group',
        isCompleted && 'opacity-80'
      )}
      onClick={onClick}
    >
      <CardContent className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm leading-tight truncate">{vishi.vishi_name}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <VishiStatusBadge status={displayStatus} />
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>Cycle {vishi.current_cycle}/{vishi.total_cycles}</span>
            <span className={cn('font-bold', balCls)}>{balText}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', isCompleted ? 'bg-teal-500' : 'bg-primary')}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Slots */}
        {vishi.my_slots.length > 0 && (
          <div className="border-t pt-2">
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
        <p className={cn('text-xs font-bold mt-0.5', balCls)}>{balText}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {slot.is_drawn && (
          <Badge variant="outline" className="border-0 rounded-full text-[10px] px-1.5 h-4 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold">
            ★ Won
          </Badge>
        )}
        {slot.ledger_status && <LedgerStatusBadge status={slot.ledger_status} />}
      </div>
    </div>
  )
}
