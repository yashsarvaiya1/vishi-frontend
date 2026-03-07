// models/ledger.ts
import type { EntryType, LedgerStatus } from './vishi'

// ─── Entry ────────────────────────────────────────────────────────────────────

export interface PaymentEntry {
  id:           number
  ledger:       number
  amount:       string        // negative = charge debit, positive = payment credit
  entry_type:   EntryType
  cycle_number: number
  note:         string
  recorded_by:  number | null  // null = cron-generated charge
  created_at:   string
}

export interface PaginatedEntries {
  count:    number
  next:     string | null
  previous: string | null
  results:  PaymentEntry[]
}

// ─── Ledger ───────────────────────────────────────────────────────────────────

/**
 * CollectionLedger — one per active participant per vishi.
 * `entries` are EMBEDDED in the retrieve response.
 * On list (/ledgers/) entries may be present per CollectionLedgerSerializer.
 */
export interface CollectionLedger {
  id:              number
  vishi:           number
  participant:     number
  balance:         string       // "0.00" | "-5000.00" | "1000.00"
  status:          LedgerStatus
  is_active:       boolean
  last_charged_at: string | null
  last_paid_at:    string | null
  updated_at:      string
  entries:         PaymentEntry[]  // embedded via serializer
}

export interface PaginatedLedgers {
  count:    number
  next:     string | null
  previous: string | null
  results:  CollectionLedger[]
}

// ─── Payload ──────────────────────────────────────────────────────────────────

export interface RecordPaymentPayload {
  amount: number
  note?:  string
}
