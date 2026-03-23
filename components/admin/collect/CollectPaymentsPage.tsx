// components/admin/collect/CollectPaymentsPage.tsx
'use client'

import { useState, useMemo }           from 'react'
import { usePaymentsSummary }          from '@/hooks/useDashboard'
import { useRecordPayment }            from '@/hooks/useLedgers'
import { Button }                      from '@/components/ui/button'
import { Input }                       from '@/components/ui/input'
import { Label }                       from '@/components/ui/label'
import { Card, CardContent }           from '@/components/ui/card'
import { Separator }                   from '@/components/ui/separator'
import { Skeleton }                    from '@/components/ui/skeleton'
import { Badge }                       from '@/components/ui/badge'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  ChevronDown, ChevronUp, IndianRupee, Loader2,
  ListChecks, AlertCircle, CheckCircle2, Check, X, ChevronsUpDown,
} from 'lucide-react'
import AdminRoute            from '@/components/shared/AdminRoute'
import PageHeader            from '@/components/shared/PageHeader'
import EmptyState            from '@/components/shared/EmptyState'
import { LedgerStatusBadge } from '@/components/shared/StatusBadge'
import { cn }                from '@/lib/utils'
import type { VishiPaymentGroup } from '@/models/dashboard'
import type { CollectionLedger }  from '@/models/ledger'


// ─── Combobox primitive ───────────────────────────────────────────────────────

interface ComboboxOption {
  value:    string
  label:    string
  sublabel?: string
  badge?:   string
  badgeCls?: string
}

function Combobox({
  options, value, onChange, placeholder, searchPlaceholder, emptyText, disabled,
}: {
  options:           ComboboxOption[]
  value:             string
  onChange:          (val: string) => void
  placeholder:       string
  searchPlaceholder: string
  emptyText:         string
  disabled?:         boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between h-11 rounded-xl font-normal px-3',
            !selected && 'text-muted-foreground'
          )}
        >
          <span className="truncate flex-1 text-left">
            {selected ? selected.label : placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {value && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onChange('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange('') } }}
                className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-10" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label + ' ' + (opt.sublabel ?? '')}
                  onSelect={() => { onChange(opt.value); setOpen(false) }}
                  className="gap-2 py-2.5"
                >
                  <Check className={cn('h-4 w-4 shrink-0', value === opt.value ? 'opacity-100' : 'opacity-0')} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0', opt.badgeCls)}>
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.sublabel && (
                      <p className="text-xs text-muted-foreground truncate">{opt.sublabel}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CollectPaymentsPage() {
  const { data, isLoading } = usePaymentsSummary()
  const groups    = useMemo(() => data?.by_vishi ?? [], [data])
  const dueGroups = useMemo(() => groups.filter((g) => g.due_participants > 0), [groups])
  const totalOutstanding = data ? parseFloat(data.total_outstanding) : 0

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader title="Collect Payments" />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : !data ? (
          <EmptyState icon={ListChecks} title="Failed to load" description="Could not fetch payment summary." />
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-linear-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-100 dark:border-rose-800 px-4 py-4 space-y-2">
                <div className="h-8 w-8 rounded-xl bg-background/60 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                </div>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 leading-none">
                  {totalOutstanding > 0 ? `₹${totalOutstanding.toLocaleString('en-IN')}` : '₹0'}
                </p>
                <p className="text-xs text-muted-foreground font-semibold">Outstanding</p>
              </div>
              <div className="rounded-2xl bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-800 px-4 py-4 space-y-2">
                <div className="h-8 w-8 rounded-xl bg-background/60 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
                  {data.total_due_count}
                </p>
                <p className="text-xs text-muted-foreground font-semibold">Due Participants</p>
              </div>
            </div>

            {/* Quick Record */}
            <QuickRecord groups={dueGroups} />

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                Pending by Vishi
              </span>
              <Separator className="flex-1" />
            </div>

            {dueGroups.length === 0 ? (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-5 py-5 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">All payments collected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">No outstanding dues across any active vishis.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {dueGroups.map((group) => (
                  <VishiPaymentSection key={group.vishi_id} group={group} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminRoute>
  )
}


// ─── Quick Record ─────────────────────────────────────────────────────────────

function QuickRecord({ groups }: { groups: VishiPaymentGroup[] }) {
  const [selectedVishiId,  setSelectedVishiId]  = useState('')
  const [selectedLedgerId, setSelectedLedgerId] = useState('')
  const [amount,           setAmount]           = useState('')
  const [note,             setNote]             = useState('')

  const selectedVishi  = groups.find((g) => String(g.vishi_id) === selectedVishiId)
  const selectedLedger = selectedVishi?.ledgers.find((l) => String(l.id) === selectedLedgerId) ?? null
  const record         = useRecordPayment(selectedVishi?.vishi_id ?? 0, selectedLedger?.id ?? 0)

  const balance    = selectedLedger ? parseFloat(selectedLedger.balance) : 0
  const owes       = balance < 0 ? Math.abs(balance) : 0
  const newBalance = selectedLedger ? parseFloat(selectedLedger.balance) + Number(amount || 0) : null
  const newStatus  = newBalance === null ? null : newBalance > 0 ? 'overpaid' : newBalance === 0 ? 'paid' : 'due'

  const reset = () => { setAmount(''); setNote(''); setSelectedLedgerId('') }

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0 || !selectedVishi || !selectedLedger) return
    record.mutate(
      { amount: Number(amount), note: note.trim() },
      { onSuccess: () => { reset(); setSelectedVishiId('') } }
    )
  }

  // Combobox options
  const vishiOptions: ComboboxOption[] = groups.map((g) => ({
    value:    String(g.vishi_id),
    label:    g.vishi_name,
    badge:    g.due_participants > 0 ? `${g.due_participants} due` : undefined,
    badgeCls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  }))

  const ledgerOptions: ComboboxOption[] = (selectedVishi?.ledgers ?? []).map((l) => {
    const bal    = parseFloat(l.balance)
    const balStr = bal < 0
      ? `-₹${Math.abs(bal).toLocaleString('en-IN')}`
      : bal > 0
      ? `+₹${bal.toLocaleString('en-IN')}`
      : '✓ Paid'
    const balCls = bal < 0
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      : bal > 0
      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    return {
      value:    String(l.id),
      label:    l.participant_name,
      sublabel: l.mobile_number,
      badge:    balStr,
      badgeCls: balCls,
    }
  })

  const quickAmounts = owes > 0
    ? [Math.round(owes / 2), owes].filter((v, i, a) => a.indexOf(v) === i && v > 0)
    : []

  return (
    <Card className="rounded-2xl">
      <CardContent className="px-5 py-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Quick Record
        </p>
        <form onSubmit={handleRecord} className="space-y-3">

          {/* Step 1 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-semibold">1 · Vishi</Label>
            <Combobox
              options={vishiOptions}
              value={selectedVishiId}
              onChange={(v) => { setSelectedVishiId(v); setSelectedLedgerId(''); setAmount('') }}
              placeholder="Select vishi..."
              searchPlaceholder="Search vishis..."
              emptyText="No vishis found."
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-semibold">2 · Participant</Label>
            <Combobox
              options={ledgerOptions}
              value={selectedLedgerId}
              onChange={(v) => { setSelectedLedgerId(v); setAmount('') }}
              placeholder={selectedVishi ? 'Select participant...' : 'Select a vishi first'}
              searchPlaceholder="Search participants..."
              emptyText="No participants found."
              disabled={!selectedVishi}
            />
          </div>

          {/* Step 3 — shown only when participant selected */}
          {selectedLedger && (
            <>
              {/* Balance summary chip */}
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participant</span>
                  <span className="font-semibold">{selectedLedger.participant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className={`font-bold ${balance < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {balance < 0
                      ? `-₹${Math.abs(balance).toLocaleString('en-IN')}`
                      : `₹${balance.toLocaleString('en-IN')}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <LedgerStatusBadge status={selectedLedger.status} />
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">3 · Amount (₹)</Label>
                <Input
                  type="number" inputMode="numeric" placeholder="Enter amount"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  min="1" autoFocus className="rounded-xl h-11"
                />
                {quickAmounts.length > 0 && (
                  <div className="flex gap-3 flex-wrap pt-0.5">
                    {quickAmounts.map((amt) => (
                      <button key={amt} type="button"
                        onClick={() => setAmount(String(amt))}
                        className="text-xs text-primary underline underline-offset-2 hover:opacity-75 font-medium">
                        ₹{amt.toLocaleString('en-IN')}{amt === owes ? ' (full)' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">
                  Note <span className="font-normal">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g. Cash collected — Apr 20"
                  value={note} onChange={(e) => setNote(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              {/* Balance preview */}
              {amount && Number(amount) > 0 && newBalance !== null && (
                <div className="rounded-xl border px-4 py-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current</span>
                    <span className={`font-semibold ${balance < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {balance < 0 ? `-₹${Math.abs(balance).toLocaleString('en-IN')}` : `₹${balance.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="text-emerald-600 font-semibold">+₹{Number(amount).toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">New Balance</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-black ${newBalance < 0 ? 'text-rose-500' : newBalance > 0 ? 'text-sky-500' : 'text-emerald-600'}`}>
                        {newBalance === 0
                          ? '₹0 · Settled'
                          : `${newBalance < 0 ? '-' : '+'}₹${Math.abs(newBalance).toLocaleString('en-IN')}`
                        }
                      </span>
                      {newStatus && <LedgerStatusBadge status={newStatus} />}
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold gap-2"
                disabled={record.isPending || !amount || Number(amount) <= 0}
              >
                {record.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><IndianRupee className="h-4 w-4" />Record Payment</>
                }
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}


// ─── Per-vishi section ────────────────────────────────────────────────────────

function VishiPaymentSection({ group }: { group: VishiPaymentGroup }) {
  const [expanded,       setExpanded]       = useState(true)
  const [selectedLedger, setSelectedLedger] = useState<CollectionLedger | null>(null)
  const totalDue = parseFloat(group.total_due)

  return (
    <>
      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">{group.vishi_name}</p>
              <div className="flex items-center gap-2 mt-1">
                {group.due_participants > 0 && (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
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
            <button
              onClick={() => setExpanded((v) => !v)}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t divide-y">
              {group.ledgers.filter((l) => l.status === 'due').length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center">No dues.</p>
              ) : (
                group.ledgers.filter((l) => l.status === 'due').map((ledger) => (
                  <LedgerRow key={ledger.id} ledger={ledger} onRecord={() => setSelectedLedger(ledger)} />
                ))
              )}
            </div>
          )}
        </CardContent>
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


function LedgerRow({ ledger, onRecord }: { ledger: CollectionLedger; onRecord: () => void }) {
  const balance = parseFloat(ledger.balance)
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{ledger.participant_name}</p>
        <p className="text-xs text-muted-foreground">{ledger.mobile_number}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-sm font-bold ${balance < 0 ? 'text-rose-500' : balance > 0 ? 'text-sky-500' : 'text-emerald-600'}`}>
            {balance < 0
              ? `Owes ₹${Math.abs(balance).toLocaleString('en-IN')}`
              : balance > 0
              ? `Credit ₹${balance.toLocaleString('en-IN')}`
              : 'Settled'
            }
          </span>
          <LedgerStatusBadge status={ledger.status} />
        </div>
      </div>
      <Button size="sm" className="h-8 text-xs shrink-0 gap-1 rounded-xl" onClick={onRecord}>
        <IndianRupee className="h-3.5 w-3.5" /> Collect
      </Button>
    </div>
  )
}


function RecordPaymentDialog({ vishiId, ledger, onClose }: {
  vishiId: number; ledger: CollectionLedger; onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [note,   setNote]   = useState('')
  const record     = useRecordPayment(vishiId, ledger.id)
  const balance    = parseFloat(ledger.balance)
  const owes       = balance < 0 ? Math.abs(balance) : 0
  const newBalance = balance + Number(amount || 0)
  const newStatus  = newBalance > 0 ? 'overpaid' : newBalance === 0 ? 'paid' : 'due'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    record.mutate(
      { amount: Number(amount), note: note.trim() },
      { onSuccess: () => { onClose(); setAmount(''); setNote('') } }
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/50 px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participant</span>
            <span className="font-semibold">{ledger.participant_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile</span>
            <span className="font-medium">{ledger.mobile_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance</span>
            <span className={`font-bold ${balance < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
              {balance < 0 ? `-₹${Math.abs(balance).toLocaleString('en-IN')}` : `₹${balance.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <LedgerStatusBadge status={ledger.status} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Amount (₹) *</Label>
            <Input
              type="number" inputMode="numeric" placeholder="Enter amount"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              autoFocus min="1" className="rounded-xl h-11"
            />
            {owes > 0 && (
              <div className="flex gap-3 flex-wrap pt-0.5">
                {[Math.round(owes / 2), owes].filter((v, i, a) => a.indexOf(v) === i).map((amt) => (
                  <button key={amt} type="button"
                    className="text-xs text-primary underline underline-offset-2 hover:opacity-75 font-medium"
                    onClick={() => setAmount(String(amt))}>
                    ₹{amt.toLocaleString('en-IN')}{amt === owes ? ' (full)' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {amount && Number(amount) > 0 && (
            <div className="rounded-xl border px-4 py-3 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold">New Balance</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-black ${newBalance < 0 ? 'text-rose-500' : newBalance > 0 ? 'text-sky-500' : 'text-emerald-600'}`}>
                    {newBalance === 0
                      ? '₹0 · Settled'
                      : `${newBalance < 0 ? '-' : '+'}₹${Math.abs(newBalance).toLocaleString('en-IN')}`
                    }
                  </span>
                  <LedgerStatusBadge status={newStatus} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Note <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
            <Input
              placeholder="e.g. Cash collected — Apr 20"
              value={note} onChange={(e) => setNote(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}
              disabled={record.isPending} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit"
              disabled={record.isPending || !amount || Number(amount) <= 0}
              className="rounded-xl">
              {record.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
