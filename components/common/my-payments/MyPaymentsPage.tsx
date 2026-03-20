// components/common/my-payments/MyPaymentsPage.tsx
'use client'

import { useMemo, useState }  from 'react'
import { useMyPayments }      from '@/hooks/useDashboard'
import { formatDate }         from '@/lib/utils'
import { Card, CardContent }  from '@/components/ui/card'
import { Button }             from '@/components/ui/button'
import {
  ChevronDown, ChevronUp,
  ArrowDownCircle, ArrowUpCircle,
  Wallet, AlertCircle, CheckCircle2, IndianRupee,
} from 'lucide-react'
import { LedgerStatusBadge }  from '@/components/shared/StatusBadge'
import EmptyState             from '@/components/shared/EmptyState'
import LoadingSpinner         from '@/components/shared/LoadingSpinner'
import PageHeader             from '@/components/shared/PageHeader'
import type { MyPaymentVishiGroup, MyPaymentSlot } from '@/models/dashboard'
import type { PaymentEntry }                       from '@/models/ledger'


export default function MyPaymentsPage() {
  const { data, isLoading, isError } = useMyPayments()
  const vishiGroups: MyPaymentVishiGroup[] = Array.isArray(data) ? data : []

  const pending = useMemo(() => {
    return vishiGroups.reduce((sum, g) => {
      const bal = parseFloat(g.total_balance)
      return bal < 0 ? sum + Math.abs(bal) : sum
    }, 0)
  }, [vishiGroups])

  const hasPending = pending > 0

  if (isLoading) return <LoadingSpinner fullPage label="Loading payments..." />
  if (isError)   return (
    <EmptyState icon={AlertCircle} title="Failed to load payments" description="Try again later." />
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Payments"
        subtitle={`${vishiGroups.length} vishi${vishiGroups.length !== 1 ? 's' : ''}`}
      />

      {/* Summary banner */}
      <div className={`rounded-2xl px-5 py-4 flex items-center gap-4 ${
        hasPending
          ? 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-100 dark:border-rose-800'
          : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800'
      }`}>
        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
          hasPending ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40'
        }`}>
          {hasPending
            ? <AlertCircle  className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            : <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          }
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            {hasPending ? 'Total Pending Dues' : 'Payment Status'}
          </p>
          <p className={`text-2xl font-black mt-0.5 ${hasPending ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {hasPending ? `₹${pending.toLocaleString('en-IN')}` : 'All Clear ✓'}
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
        <div className="space-y-3">
          {vishiGroups.map((group) => (
            <VishiPaymentSection key={group.vishi_id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}


function VishiPaymentSection({ group }: { group: MyPaymentVishiGroup }) {
  const [expanded, setExpanded] = useState(false)

  const totalBalance = parseFloat(group.total_balance)
  const hasDue       = group.slots.some((s) => s.status === 'due')
  const balCls       = totalBalance < 0 ? 'text-rose-600' : totalBalance > 0 ? 'text-sky-600' : 'text-emerald-600'
  const balText      = totalBalance === 0
    ? '₹0'
    : `${totalBalance < 0 ? '-' : '+'}₹${Math.abs(totalBalance).toLocaleString('en-IN')}`

  return (
    <Card className={`rounded-2xl overflow-hidden ${hasDue ? 'border-rose-200 dark:border-rose-800' : ''}`}>
      <CardContent className="px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm truncate">{group.vishi_name}</p>
              {hasDue && (
                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
              )}
            </div>
            <p className={`text-xl font-black mt-0.5 ${balCls}`}>{balText}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs gap-1.5 text-muted-foreground rounded-xl hover:bg-muted shrink-0"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded
              ? <><ChevronUp   className="h-3.5 w-3.5" /> Hide</>
              : <><ChevronDown className="h-3.5 w-3.5" /> Details</>
            }
          </Button>
        </div>
      </CardContent>

      {expanded && (
        <div className="border-t divide-y bg-muted/20">
          {group.slots.map((slot, i) => (
            <SlotSection key={`${slot.slot_name}-${i}`} slot={slot} />
          ))}
        </div>
      )}
    </Card>
  )
}


function SlotSection({ slot }: { slot: MyPaymentSlot }) {
  const [showEntries, setShowEntries] = useState(false)

  const bal     = parseFloat(slot.balance)
  const balCls  = bal < 0 ? 'text-rose-600' : bal > 0 ? 'text-sky-600' : 'text-emerald-600'
  const balText = bal < 0
    ? `-₹${Math.abs(bal).toLocaleString('en-IN')}`
    : bal > 0
    ? `+₹${bal.toLocaleString('en-IN')}`
    : 'Paid'

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{slot.slot_name || 'My Slot'}</p>
          <p className={`text-sm font-bold mt-0.5 ${balCls}`}>{balText}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LedgerStatusBadge status={slot.status} />
          {slot.entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground rounded-lg"
              onClick={() => setShowEntries((v) => !v)}
            >
              {showEntries ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {slot.entries.length}
            </Button>
          )}
        </div>
      </div>

      {showEntries && slot.entries.length > 0 && (
        <div className="mt-2.5 border rounded-xl overflow-hidden divide-y bg-background">
          {[...slot.entries].reverse().map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}


function EntryRow({ entry }: { entry: PaymentEntry }) {
  const isCharge = entry.entry_type === 'charge'
  const amount   = parseFloat(entry.amount)

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
        isCharge ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'
      }`}>
        {isCharge
          ? <ArrowDownCircle className="h-4 w-4 text-rose-500" />
          : <ArrowUpCircle   className="h-4 w-4 text-emerald-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold">
          {isCharge ? 'Charge' : 'Payment'} · Cycle {entry.cycle_number}
        </p>
        {entry.note && <p className="text-xs text-muted-foreground truncate">{entry.note}</p>}
        <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
      </div>
      <p className={`text-sm font-bold shrink-0 ${amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
        {amount > 0 ? '+' : ''}₹{Math.abs(amount).toLocaleString('en-IN')}
      </p>
    </div>
  )
}
