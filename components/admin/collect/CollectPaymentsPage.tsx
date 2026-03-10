// components/admin/collect/CollectPaymentsPage.tsx
'use client'

import { useState, useMemo }           from 'react'
import { usePaymentsSummary }          from '@/hooks/useDashboard'
import { useRecordPayment }            from '@/hooks/useLedgers'
import { Button }                      from '@/components/ui/button'
import { Input }                       from '@/components/ui/input'
import { Label }                       from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator }                   from '@/components/ui/separator'
import { Skeleton }                    from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  ChevronDown, ChevronUp, IndianRupee, Loader2, ListChecks,
} from 'lucide-react'
import AdminRoute         from '@/components/shared/AdminRoute'
import PageHeader         from '@/components/shared/PageHeader'
import EmptyState         from '@/components/shared/EmptyState'
import { LedgerStatusBadge } from '@/components/shared/StatusBadge'
import type { VishiPaymentGroup } from '@/models/dashboard'
import type { CollectionLedger }  from '@/models/ledger'


// ─── Page ─────────────────────────────────────────────────────────────────────


export default function CollectPaymentsPage() {
  const { data, isLoading } = usePaymentsSummary()

  // FIXED: data.by_vishi (not data.vishi_groups)
  const groups = useMemo(() => data?.by_vishi ?? [], [data])

  // FIXED: due_participants (not due_count)
  const dueGroups = useMemo(
    () => groups.filter((g) => g.due_participants > 0),
    [groups]
  )

  const totalOutstanding = data ? parseFloat(data.total_outstanding) : 0
  // FIXED: total_due_count is a number — not a currency amount, removed total_overpaid

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader title="Collect Payments" />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : !data ? (
          <EmptyState
            icon={ListChecks}
            title="Failed to load"
            description="Could not fetch payment summary."
          />
        ) : (
          <>
            {/* ── Summary banner ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 space-y-1">
                <p className="text-xs text-muted-foreground">Total Outstanding</p>
                <p className="text-xl font-bold text-red-600">
                  {totalOutstanding > 0
                    ? `₹${totalOutstanding.toLocaleString('en-IN')}`
                    : '₹0'
                  }
                </p>
              </div>
              {/* FIXED: total_due_count is a count, not currency */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 space-y-1">
                <p className="text-xs text-muted-foreground">Due Participants</p>
                <p className="text-xl font-bold text-amber-600">
                  {data.total_due_count}
                </p>
              </div>
            </div>

            {/*
             * Flow §6.1 — QUICK RECORD:
             * Step 1 → select vishi
             * Step 2 → select participant (after vishi selected)
             * Step 3 → enter amount with quick-fill + balance preview
             */}
            <QuickRecord groups={groups} />

            <Separator />

            {/* ── Pending Dues grouped by vishi ── */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Pending Dues — All Vishis
              </h3>

              {dueGroups.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title="All payments collected"
                  description="No outstanding dues across any active vishis."
                />
              ) : (
                <div className="space-y-4">
                  {dueGroups.map((group) => (
                    <VishiPaymentSection key={group.vishi_id} group={group} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminRoute>
  )
}


// ─── Quick Record (flow §6.1) ─────────────────────────────────────────────────


function QuickRecord({ groups }: { groups: VishiPaymentGroup[] }) {
  const [selectedVishiId,  setSelectedVishiId]  = useState<string>('')
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('')
  const [amount,           setAmount]           = useState('')
  const [note,             setNote]             = useState('')

  const selectedVishi = groups.find((g) => String(g.vishi_id) === selectedVishiId)

  // FIXED: ledger.id (not ledger.ledger_id) — CollectionLedger uses `id`
  const selectedLedger = selectedVishi?.ledgers.find(
    (l) => String(l.id) === selectedLedgerId
  ) ?? null

  // FIXED: useRecordPayment uses vishi_id and ledger.id
  const record = useRecordPayment(
    selectedVishi?.vishi_id ?? 0,
    selectedLedger?.id ?? 0
  )

  const balance = selectedLedger ? parseFloat(selectedLedger.balance) : 0
  const owes    = balance < 0 ? Math.abs(balance) : 0

  const newBalance = selectedLedger
    ? (parseFloat(selectedLedger.balance) + Number(amount || 0))
    : null

  const newStatus =
    newBalance === null  ? null      :
    newBalance > 0       ? 'overpaid':
    newBalance === 0     ? 'paid'    :
                           'due'

  const reset = () => {
    setAmount('')
    setNote('')
    setSelectedLedgerId('')
  }

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0 || !selectedVishi || !selectedLedger) return
    record.mutate(
      { amount: Number(amount), note: note.trim() },
      {
        onSuccess: () => {
          reset()
          setSelectedVishiId('')
        },
      }
    )
  }

  const quickAmounts = owes > 0
    ? [Math.round(owes / 2), owes].filter((v, i, a) => a.indexOf(v) === i && v > 0)
    : []

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Quick Record</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <form onSubmit={handleRecord} className="space-y-3">

          {/* Step 1 — Select Vishi */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Step 1 — Select Vishi</Label>
            <Select
              value={selectedVishiId}
              onValueChange={(v) => {
                setSelectedVishiId(v)
                setSelectedLedgerId('')
                setAmount('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vishi..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.vishi_id} value={String(g.vishi_id)}>
                    <span>{g.vishi_name}</span>
                    {/* FIXED: due_participants (not due_count) */}
                    {g.due_participants > 0 && (
                      <span className="ml-2 text-xs text-red-500">
                        ({g.due_participants} due)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2 — Select Participant */}
          {selectedVishi && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Step 2 — Select Participant</Label>
              <Select
                value={selectedLedgerId}
                onValueChange={(v) => {
                  setSelectedLedgerId(v)
                  setAmount('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select participant..." />
                </SelectTrigger>
                <SelectContent>
                  {/* FIXED: l.id (not l.ledger_id), l.participant_name, l.status */}
                  {selectedVishi.ledgers.map((l) => {
                    const bal = parseFloat(l.balance)
                    return (
                      <SelectItem key={l.id} value={String(l.id)}>
                        <div className="flex items-center gap-2">
                          <span>{l.participant_name}</span>
                          <span className={`text-xs font-medium ${
                            bal < 0 ? 'text-red-500' :
                            bal > 0 ? 'text-blue-500' :
                                      'text-green-600'
                          }`}>
                            {bal < 0
                              ? `-₹${Math.abs(bal).toLocaleString('en-IN')}`
                              : bal > 0
                              ? `+₹${bal.toLocaleString('en-IN')}`
                              : '✓ Paid'
                            }
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3 — Enter amount */}
          {selectedLedger && (
            <>
              <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participant</span>
                  <span className="font-medium">{selectedLedger.participant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding</span>
                  <span className={`font-semibold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {balance < 0
                      ? `-₹${Math.abs(balance).toLocaleString('en-IN')}`
                      : `₹${balance.toLocaleString('en-IN')}`
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Step 3 — Enter Amount (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  autoFocus
                />
                {quickAmounts.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className="text-xs text-primary underline underline-offset-2 hover:opacity-75"
                        onClick={() => setAmount(String(amt))}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                        {amt === owes && ' (exact)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Note <span className="font-normal">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g. Collected in person — Apr 20"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Balance preview */}
              {amount && Number(amount) > 0 && newBalance !== null && (
                <div className="rounded-lg border px-3 py-2.5 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className={balance < 0 ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
                      {balance < 0
                        ? `-₹${Math.abs(balance).toLocaleString('en-IN')}`
                        : `₹${balance.toLocaleString('en-IN')}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="text-green-600 font-semibold">
                      +₹{Number(amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">New Balance</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold ${
                        newBalance < 0 ? 'text-red-500' :
                        newBalance > 0 ? 'text-blue-500' :
                                         'text-green-600'
                      }`}>
                        {newBalance === 0
                          ? '₹0'
                          : `${newBalance < 0 ? '-' : '+'}₹${Math.abs(newBalance).toLocaleString('en-IN')}`
                        }
                      </span>
                      {newStatus && <LedgerStatusBadge status={newStatus} />}
                    </div>
                  </div>
                  {newBalance > 0 && (
                    <p className="text-blue-500 text-xs">
                      ₹{newBalance.toLocaleString('en-IN')} credit carries to next cycle.
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={record.isPending || !amount || Number(amount) <= 0}
              >
                {record.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><IndianRupee className="h-4 w-4 mr-1.5" />Record Payment</>
                }
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}


// ─── Per-vishi collapsible section ────────────────────────────────────────────


function VishiPaymentSection({ group }: { group: VishiPaymentGroup }) {
  const [expanded,       setExpanded]       = useState(true)
  // FIXED: CollectionLedger (not LedgerSummaryItem — that type doesn't exist)
  const [selectedLedger, setSelectedLedger] = useState<CollectionLedger | null>(null)

  const totalDue = parseFloat(group.total_due)

  return (
    <>
      <Card className="rounded-xl overflow-hidden">
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{group.vishi_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* FIXED: due_participants (not due_count) */}
                {group.due_participants > 0 && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
                    {group.due_participants} due
                  </span>
                )}
                {totalDue > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ₹{totalDue.toLocaleString('en-IN')} outstanding
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground shrink-0"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? <ChevronUp   className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent className="px-4 pb-3 pt-3">
            {/* FIXED: l.status (not l.ledger_status) — CollectionLedger uses `status` */}
            {group.ledgers.filter((l) => l.status === 'due').length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 text-center">
                No dues for this vishi.
              </p>
            ) : (
              <div className="divide-y">
                {group.ledgers
                  .filter((l) => l.status === 'due')
                  .map((ledger) => (
                    <LedgerRow
                      key={ledger.id}
                      ledger={ledger}
                      onRecord={() => setSelectedLedger(ledger)}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {selectedLedger && (
        <RecordPaymentDialog
          vishiId={group.vishi_id}
          ledger={selectedLedger}
          onClose={() => setSelectedLedger(null)}
        />
      )}
    </>
  )
}


// ─── Ledger row ───────────────────────────────────────────────────────────────


// FIXED: CollectionLedger (not LedgerSummaryItem)
function LedgerRow({
  ledger, onRecord,
}: {
  ledger:   CollectionLedger
  onRecord: () => void
}) {
  const balance = parseFloat(ledger.balance)

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{ledger.participant_name}</p>
        <p className="text-xs text-muted-foreground">{ledger.mobile_number}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-sm font-semibold ${
            balance < 0 ? 'text-red-500' :
            balance > 0 ? 'text-blue-500' :
                          'text-green-600'
          }`}>
            {balance < 0
              ? `Owes ₹${Math.abs(balance).toLocaleString('en-IN')}`
              : balance > 0
              ? `Credit ₹${balance.toLocaleString('en-IN')}`
              : 'Settled'
            }
          </span>
          {/* FIXED: ledger.status (not ledger.ledger_status) */}
          <LedgerStatusBadge status={ledger.status} />
        </div>
      </div>

      <Button
        size="sm"
        variant="default"
        className="h-8 text-xs shrink-0 gap-1"
        onClick={onRecord}
      >
        <IndianRupee className="h-3.5 w-3.5" />
        Collect
      </Button>
    </div>
  )
}


// ─── Record payment dialog (flow §6.2) ───────────────────────────────────────


// FIXED: CollectionLedger (not LedgerSummaryItem), ledger.id (not ledger.ledger_id)
function RecordPaymentDialog({
  vishiId, ledger, onClose,
}: {
  vishiId: number
  ledger:  CollectionLedger
  onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [note,   setNote]   = useState('')

  // FIXED: ledger.id
  const record = useRecordPayment(vishiId, ledger.id)

  const balance = parseFloat(ledger.balance)
  const owes    = balance < 0 ? Math.abs(balance) : 0

  const newBalance = balance + Number(amount || 0)
  const newStatus  =
    newBalance > 0  ? 'overpaid' :
    newBalance === 0 ? 'paid'    :
                       'due'

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
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-muted px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participant</span>
            <span className="font-medium">{ledger.participant_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile</span>
            <span className="font-medium">{ledger.mobile_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance</span>
            <span className={`font-semibold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {balance < 0
                ? `-₹${Math.abs(balance).toLocaleString('en-IN')}`
                : `₹${balance.toLocaleString('en-IN')}`
              }
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            {/* FIXED: ledger.status */}
            <LedgerStatusBadge status={ledger.status} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Amount (₹) *</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              min="1"
            />
            {owes > 0 && (
              <div className="flex gap-3 flex-wrap pt-0.5">
                {[Math.round(owes / 2), owes]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="text-xs text-primary underline underline-offset-2 hover:opacity-75"
                      onClick={() => setAmount(String(amt))}
                    >
                      ₹{amt.toLocaleString('en-IN')}{amt === owes ? ' (full)' : ''}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {amount && Number(amount) > 0 && (
            <div className="rounded-lg border px-3 py-2.5 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Balance</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${
                    newBalance < 0 ? 'text-red-500' :
                    newBalance > 0 ? 'text-blue-500' :
                                     'text-green-600'
                  }`}>
                    {newBalance === 0
                      ? '₹0'
                      : `${newBalance < 0 ? '-' : '+'}₹${Math.abs(newBalance).toLocaleString('en-IN')}`
                    }
                  </span>
                  <LedgerStatusBadge status={newStatus} />
                </div>
              </div>
              {newBalance > 0 && (
                <p className="text-blue-500">
                  ₹{newBalance.toLocaleString('en-IN')} credit carries to next cycle.
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>
              Note <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. Collected in person — Apr 20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={record.isPending}
            >
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
