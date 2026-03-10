// components/common/my-payments/MyPaymentsPage.tsx
'use client'

import { useMemo, useState }  from 'react'
import { useMyPayments }      from '@/hooks/useDashboard'
import { formatDate }         from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton }           from '@/components/ui/skeleton'
import { Button }             from '@/components/ui/button'
import {
  ChevronDown, ChevronUp,
  ArrowDownCircle, ArrowUpCircle,
  Wallet, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { LedgerStatusBadge }  from '@/components/shared/StatusBadge'
import EmptyState             from '@/components/shared/EmptyState'
import LoadingSpinner         from '@/components/shared/LoadingSpinner'
import PageHeader             from '@/components/shared/PageHeader'
import type { MyVishiPaymentGroup, MyPaymentEntry } from '@/models/dashboard'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyPaymentsPage() {
  const { data, isLoading, isError } = useMyPayments()

  // Group the flat `groups` array by vishi_id on the frontend
  const vishiGroups = useMemo(() => {
    if (!data?.groups) return []
    const map = new Map<number, { vishi_id: number; vishi_name: string; slots: MyVishiPaymentGroup[] }>()
    for (const g of data.groups) {
      if (!map.has(g.vishi_id)) {
        map.set(g.vishi_id, { vishi_id: g.vishi_id, vishi_name: g.vishi_name, slots: [] })
      }
      map.get(g.vishi_id)!.slots.push(g)
    }
    return Array.from(map.values())
  }, [data?.groups])

  const pending = data ? parseFloat(data.total_pending_balance) : 0
  const hasPending = pending < 0

  if (isLoading) return <LoadingSpinner fullPage label="Loading payments..." />

  if (isError || !data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load payments"
        description="Try again later."
      />
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Payments"
        subtitle={`${vishiGroups.length} vishi${vishiGroups.length !== 1 ? 's' : ''}`}
      />

      {/* Summary banner */}
      <div className={`rounded-xl px-4 py-4 flex items-center gap-3 ${
        hasPending
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-green-50 dark:bg-green-900/20'
      }`}>
        {hasPending
          ? <AlertCircle  className="h-5 w-5 text-red-500 shrink-0" />
          : <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        }
        <div>
          <p className="text-xs text-muted-foreground">
            {hasPending ? 'Total Pending Dues' : 'Total Balance'}
          </p>
          <p className={`text-xl font-bold ${hasPending ? 'text-red-600' : 'text-green-600'}`}>
            {hasPending
              ? `₹${Math.abs(pending).toLocaleString('en-IN')}`
              : 'All Clear ✓'
            }
          </p>
        </div>
      </div>

      {vishiGroups.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payments yet"
          description="You are not part of any vishi. Contact admin to be added."
        />
      ) : (
        <div className="space-y-4">
          {vishiGroups.map((group) => (
            <VishiPaymentSection key={group.vishi_id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Per-Vishi Section ────────────────────────────────────────────────────────

function VishiPaymentSection({
  group,
}: {
  group: { vishi_id: number; vishi_name: string; slots: MyVishiPaymentGroup[] }
}) {
  // Start first vishi expanded
  const [expanded, setExpanded] = useState(false)

  // Aggregate balance across all slots in this vishi
  const totalBalance = group.slots.reduce(
    (sum, s) => sum + parseFloat(s.balance), 0
  )
  const hasDue      = group.slots.some((s) => s.ledger_status === 'due')
  const balanceCls  =
    totalBalance < 0 ? 'text-red-500' :
    totalBalance > 0 ? 'text-blue-500' :
                       'text-green-600'

  return (
    <Card className="rounded-xl overflow-hidden">
      {/* Vishi header — always visible */}
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base truncate flex-1">{group.vishi_name}</CardTitle>
          {hasDue && (
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-0">
        {/* Balance row */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Balance</p>
            <p className={`text-xl font-bold ${balanceCls}`}>
              {totalBalance === 0
                ? '₹0'
                : `${totalBalance < 0 ? '-' : '+'}₹${Math.abs(totalBalance).toLocaleString('en-IN')}`
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1 text-muted-foreground"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded
              ? <><ChevronUp   className="h-3.5 w-3.5" /> Hide</>
              : <><ChevronDown className="h-3.5 w-3.5" /> Details</>
            }
          </Button>
        </div>
      </CardContent>

      {/* Expanded: each slot with its entries */}
      {expanded && (
        <div className="border-t divide-y">
          {group.slots.map((slot) => (
            <SlotSection key={slot.participant_id} slot={slot} />
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Per-Slot Section ─────────────────────────────────────────────────────────

function SlotSection({ slot }: { slot: MyVishiPaymentGroup }) {
  const [showEntries, setShowEntries] = useState(false)

  const bal     = parseFloat(slot.balance)
  const balCls  = bal < 0 ? 'text-red-500' : bal > 0 ? 'text-blue-500' : 'text-green-600'
  const balText =
    bal < 0 ? `-₹${Math.abs(bal).toLocaleString('en-IN')}` :
    bal > 0 ? `+₹${bal.toLocaleString('en-IN')}`           :
              'Paid'

  return (
    <div className="px-4 py-3">
      {/* Slot header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{slot.slot_name || 'My Slot'}</p>
          <p className={`text-sm font-semibold mt-0.5 ${balCls}`}>{balText}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LedgerStatusBadge status={slot.ledger_status} />
          {slot.entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground"
              onClick={() => setShowEntries((v) => !v)}
            >
              {showEntries
                ? <ChevronUp   className="h-3 w-3" />
                : <ChevronDown className="h-3 w-3" />
              }
              {slot.entries.length}
            </Button>
          )}
        </div>
      </div>

      {/* Entries list — lazy toggle, already in response (no extra fetch) */}
      {showEntries && slot.entries.length > 0 && (
        <div className="mt-2 space-y-0 border rounded-lg overflow-hidden divide-y bg-muted/20">
          {[...slot.entries].reverse().map((entry) => (
            <EntryRow key={entry.entry_id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Entry Row ────────────────────────────────────────────────────────────────

function EntryRow({ entry }: { entry: MyPaymentEntry }) {
  const isCharge = entry.entry_type === 'charge'
  const amount   = parseFloat(entry.amount)

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      {isCharge
        ? <ArrowDownCircle className="h-7 w-7 text-red-400   shrink-0" />
        : <ArrowUpCircle   className="h-7 w-7 text-green-500 shrink-0" />
      }
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">
          {isCharge ? 'Charge' : 'Payment'} — Cycle {entry.cycle_number}
        </p>
        {entry.note && (
          <p className="text-xs text-muted-foreground truncate">{entry.note}</p>
        )}
        <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
      </div>
      <p className={`text-sm font-bold shrink-0 ${amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
        {amount > 0 ? '+' : ''}₹{Math.abs(amount).toLocaleString('en-IN')}
      </p>
    </div>
  )
}
