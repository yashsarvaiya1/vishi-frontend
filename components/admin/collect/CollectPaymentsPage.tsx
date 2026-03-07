// components/admin/collect/CollectPaymentsPage.tsx
'use client'

import { useState } from 'react'
import { useVishis } from '@/hooks/useVishis'
import { useLedgers, useRecordPayment } from '@/hooks/useLedgers'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { ChevronDown, ChevronUp, IndianRupee, Loader2, ListChecks } from 'lucide-react'
import AdminRoute from '@/components/shared/AdminRoute'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import { VishiStatusBadge, LedgerStatusBadge } from '@/components/shared/StatusBadge'
import type { VishiAdmin } from '@/models/vishi'
import type { CollectionLedger } from '@/models/ledger'


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CollectPaymentsPage() {
  const { data, isLoading } = useVishis()
  const vishis       = (data?.results ?? []) as VishiAdmin[]
  const activeVishis = vishis.filter((v) => v.status === 'active')

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader
          title="Collect Payments"
          subtitle={
            !isLoading
              ? `${activeVishis.length} active vishi${activeVishis.length !== 1 ? 's' : ''}`
              : undefined
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : activeVishis.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No active vishis"
            description="Activate a vishi first to start collecting payments."
          />
        ) : (
          <div className="space-y-4">
            {activeVishis.map((vishi) => (
              <VishiLedgerSection key={vishi.id} vishi={vishi} />
            ))}
          </div>
        )}
      </div>
    </AdminRoute>
  )
}


// ─── Per-vishi collapsible section ────────────────────────────────────────────

function VishiLedgerSection({ vishi }: { vishi: VishiAdmin }) {
  const [expanded,       setExpanded]       = useState(true)
  const [selectedLedger, setSelectedLedger] = useState<CollectionLedger | null>(null)

  const { data: ledgersData, isLoading } = useLedgers(vishi.id)
  const ledgers  = (ledgersData?.results ?? []) as CollectionLedger[]
  const dueCount = ledgers.filter((l) => l.status === 'due').length

  const getParticipantName = (participantId: number): string => {
    const p = vishi.participants.find((x) => x.id === participantId)
    return p?.vishi_name || p?.user_detail?.username || `Participant #${participantId}`
  }

  return (
    <>
      <Card className="rounded-xl overflow-hidden">
        {/* Vishi header — always visible */}
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{vishi.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatFrequency(vishi.frequency)}
                {' · '}Cycle {vishi.current_cycle}/{vishi.total_cycles}
                {' · '}Collection: <span className="font-medium">{formatDate(vishi.current_collection_date)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {dueCount > 0 && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
                  {dueCount} due
                </span>
              )}
              <VishiStatusBadge status={vishi.status} />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Ledger list */}
        {expanded && (
          <CardContent className="px-4 pb-4 space-y-0 pt-0">
            {isLoading ? (
              <div className="space-y-2 pt-1">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : ledgers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No ledgers found.
              </p>
            ) : (
              <div className="divide-y">
                {ledgers.map((ledger) => (
                  <LedgerRow
                    key={ledger.id}
                    ledger={ledger}
                    participantName={getParticipantName(ledger.participant)}
                    onRecord={() => setSelectedLedger(ledger)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Record payment dialog — scoped to this vishi section */}
      {selectedLedger && (
        <RecordPaymentDialog
          vishiId={vishi.id}
          ledger={selectedLedger}
          participantName={getParticipantName(selectedLedger.participant)}
          vishiAmount={parseFloat(vishi.amount)}
          onClose={() => setSelectedLedger(null)}
        />
      )}
    </>
  )
}


// ─── Ledger row ───────────────────────────────────────────────────────────────

function LedgerRow({
  ledger, participantName, onRecord,
}: {
  ledger:          CollectionLedger
  participantName: string
  onRecord:        () => void
}) {
  const balance = parseFloat(ledger.balance)

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{participantName}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-sm font-semibold ${
            balance < 0 ? 'text-red-500' :
            balance > 0 ? 'text-blue-500' :
            'text-green-600'
          }`}>
            {balance < 0
              ? `Owes ${formatCurrency(Math.abs(balance))}`
              : balance > 0
              ? `Credit ${formatCurrency(balance)}`
              : 'Settled'
            }
          </span>
          <LedgerStatusBadge status={ledger.status} />
        </div>
        {ledger.last_charged_at && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Charged: {formatDate(ledger.last_charged_at)}
            {ledger.last_paid_at && ` · Paid: ${formatDate(ledger.last_paid_at)}`}
          </p>
        )}
      </div>

      {/* Only show Record button if due or recording a custom amount for overpaid */}
      {ledger.is_active && ledger.status !== 'paid' && (
        <Button
          size="sm"
          variant={ledger.status === 'due' ? 'default' : 'outline'}
          className="h-8 text-xs shrink-0 gap-1"
          onClick={onRecord}
        >
          <IndianRupee className="h-3.5 w-3.5" />
          Record
        </Button>
      )}
    </div>
  )
}


// ─── Record payment dialog ────────────────────────────────────────────────────

function RecordPaymentDialog({
  vishiId, ledger, participantName, vishiAmount, onClose,
}: {
  vishiId:         number
  ledger:          CollectionLedger
  participantName: string
  vishiAmount:     number
  onClose:         () => void
}) {
  const [amount, setAmount] = useState('')
  const [note,   setNote]   = useState('')
  const record = useRecordPayment(vishiId, ledger.id)

  const balance  = parseFloat(ledger.balance)
  const owes     = balance < 0 ? Math.abs(balance) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    record.mutate(
      { amount: Number(amount), note: note.trim() },
      {
        onSuccess: () => {
          onClose()
          setAmount('')
          setNote('')
        },
      }
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        {/* Participant summary */}
        <div className="rounded-lg bg-muted px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participant</span>
            <span className="font-medium">{participantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance</span>
            <span className={`font-semibold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <LedgerStatusBadge status={ledger.status} />
          </div>
        </div>

        {/* Quick fill buttons */}
        {owes > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="text-xs text-primary underline underline-offset-2 hover:opacity-75"
              onClick={() => setAmount(String(owes))}
            >
              Fill exact ({formatCurrency(owes)})
            </button>
            {vishiAmount > 0 && vishiAmount !== owes && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:opacity-75"
                onClick={() => setAmount(String(vishiAmount))}
              >
                1 cycle ({formatCurrency(vishiAmount)})
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Amount (₹) *</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              min="1"
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              Note
              <span className="text-muted-foreground ml-1">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. Cash collected on 20 March"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={record.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={record.isPending || !amount || Number(amount) <= 0}
            >
              {record.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : 'Record Payment'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
