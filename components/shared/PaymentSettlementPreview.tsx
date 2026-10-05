import type { CollectionLedger } from '@/models/ledger'

export default function PaymentSettlementPreview({ ledger, amount }: { ledger: CollectionLedger; amount: number }) {
  if (!Number.isFinite(amount) || amount <= 0) return null
  const owed = Math.max(0, -Number(ledger.balance))
  const late = Math.min(amount, owed, Math.max(0, Number(ledger.late_amount ?? 0)))
  const current = Math.min(amount, owed) - late
  const advance = Math.max(0, amount - owed)
  return (
    <p className="text-xs text-muted-foreground" aria-live="polite">
      {[
        ['Late payment', late], ['Current dues', current], ['Advance', advance],
      ].filter(([, value]) => Number(value) > 0)
        .map(([label, value]) => `${label}: ₹${Number(value).toLocaleString('en-IN')}`).join(' · ')}
    </p>
  )
}
