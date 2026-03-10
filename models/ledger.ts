// models/ledger.ts
import type { EntryType, LedgerStatus } from './vishi'

// ─── Entry ────────────────────────────────────────────────────────────────────

export interface PaymentEntry {
  id:           number
  ledger:       number
  amount:       string        // negative = charge, positive = payment credit
  entry_type:   EntryType
  cycle_number: number
  note:         string
  recorded_by:  number | null
  created_at:   string
}

export interface PaginatedEntries {
  count:    number
  next:     string | null
  previous: string | null
  results:  PaymentEntry[]
}

// ─── Ledger ───────────────────────────────────────────────────────────────────

export interface CollectionLedger {
  id:               number
  vishi:            number
  participant:      number
  balance:          string
  status:           LedgerStatus
  is_active:        boolean
  last_charged_at:  string | null
  last_paid_at:     string | null
  updated_at:       string
  participant_name: string   // ← ADDED: "Raj-Home"
  mobile_number:    string   // ← ADDED: "9876543210"
  entries:          PaymentEntry[]
}

export interface PaginatedLedgers {
  count:    number
  next:     string | null
  previous: string | null
  results:  CollectionLedger[]
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface RecordPaymentPayload {
  amount: number | string
  note?:  string
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface LedgersQueryParams {
  status?:    LedgerStatus
  is_active?: boolean
}

export interface EntriesQueryParams {
  entry_type?:  EntryType
  cycle_number?: number
}
