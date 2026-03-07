// components/common/my-payments/MyPaymentsPage.tsx
'use client'

import { useState } from 'react'
import { useVishis } from '@/hooks/useVishis'
import { useLedgers } from '@/hooks/useLedgers'
import { usePaymentEntries } from '@/hooks/usePayments'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ArrowDownCircle, ArrowUpCircle, IndianRupee, Wallet } from 'lucide-react'
import { VishiStatusBadge, LedgerStatusBadge } from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import PageHeader from '@/components/shared/PageHeader'
import type { VishiPublic } from '@/models/vishi'
import type { CollectionLedger } from '@/models/ledger'


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyPaymentsPage() {
  const { data, isLoading } = useVishis()
  const vishis = (data?.results ?? []) as VishiPublic[]

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Payments"
        subtitle={!isLoading ? `${vishis.length} vishi${vishis.length !== 1 ? 's' : ''}` : undefined}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : vishis.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No vishis yet"
          description="You are not part of any vishi. Contact admin to be added."
        />
      ) : (
        <div className="space-y-4">
          {vishis.map((vishi) => (
            <VishiPaymentSection key={vishi.id} vishi={vishi} />
          ))}
        </div>
      )}
    </div>
  )
}


// ─── Per-Vishi Section ────────────────────────────────────────────────────────

function VishiPaymentSection({ vishi }: { vishi: VishiPublic }) {
  const [expanded, setExpanded] = useState(false)

  const { data: ledgersData, isLoading: loadingLedgers } = useLedgers(vishi.id)
  const ledgers = (ledgersData?.results ?? []) as CollectionLedger[]
  const ledger  = ledgers[0]   // user has exactly 1 ledger per vishi

  return (
    <Card className="rounded-xl overflow-hidden">
      {/* Vishi header — always visible */}
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{vishi.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatFrequency(vishi.frequency)} · Cycle {vishi.current_cycle}/{vishi.total_cycles}
            </p>
          </div>
          <VishiStatusBadge status={vishi.status} />
        </div>
      </CardHeader>

      {/* Ledger summary row */}
      <CardContent className="px-4 pb-0">
        {loadingLedgers ? (
          <Skeleton className="h-12 rounded-lg mb-3" />
        ) : !ledger ? (
          <p className="text-xs text-muted-foreground pb-3">No ledger found.</p>
        ) : (
          <div className="flex items-center justify-between py-2 pb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
              <p className={`text-xl font-bold ${
                parseFloat(ledger.balance) < 0
                  ? 'text-red-500'
                  : parseFloat(ledger.balance) > 0
                  ? 'text-blue-500'
                  : 'text-green-600'
              }`}>
                {formatCurrency(ledger.balance)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LedgerStatusBadge status={ledger.status} />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs gap-1 text-muted-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? (
                  <><ChevronUp className="h-3.5 w-3.5" /> Hide</>
                ) : (
                  <><ChevronDown className="h-3.5 w-3.5" /> History</>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Expandable transaction history */}
      {expanded && ledger && (
        <>
          <Separator />
          <TransactionHistory vishiId={vishi.id} ledgerId={ledger.id} />
        </>
      )}
    </Card>
  )
}


// ─── Transaction History (lazy — only fetches when expanded) ──────────────────

function TransactionHistory({
  vishiId, ledgerId,
}: { vishiId: number; ledgerId: number }) {
  const { data, isLoading } = usePaymentEntries(vishiId, ledgerId)
  const entries = data?.results ?? []

  if (isLoading) {
    return (
      <div className="px-4 py-4">
        <LoadingSpinner size="sm" label="Loading transactions..." />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">No transactions yet.</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {entries.map((entry) => {
        const isCharge = entry.entry_type === 'charge'
        const amount   = parseFloat(entry.amount)
        return (
          <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
            {isCharge
              ? <ArrowDownCircle className="h-8 w-8 text-red-500 shrink-0" />
              : <ArrowUpCircle   className="h-8 w-8 text-green-500 shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {isCharge ? 'Charge' : 'Payment'} — Cycle {entry.cycle_number}
              </p>
              {entry.note && (
                <p className="text-xs text-muted-foreground truncate">{entry.note}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
            </div>
            <p className={`text-sm font-bold shrink-0 ${
              amount < 0 ? 'text-red-500' : 'text-green-600'
            }`}>
              {amount > 0 ? '+' : ''}{formatCurrency(amount)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
