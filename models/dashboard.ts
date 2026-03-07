// models/dashboard.ts

import type { LedgerStatus, VishiStatus, EntryType } from './vishi'

// ─── M1: Admin Dashboard ──────────────────────────────────────────────────────

export type AlertType = 'draw_overdue' | 'release_pending' | 'payments_pending'

export interface ActionAlert {
  vishi_id:      number
  vishi_name:    string
  type:          AlertType
  detail:        string
  days_overdue?: number          // for draw_overdue / release_pending
  pending_count?: number         // for payments_pending
}

export interface UpcomingEvent {
  date:       string
  vishi_id:   number
  vishi_name: string
  event_type: 'draw' | 'collection' | 'release'
}

export interface AdminDashboard {
  active_vishis:   number
  upcoming_vishis: number
  total_members:   number   // total active VishiParticipant count
  total_users:     number   // total active User count
  action_alerts:   ActionAlert[]
  upcoming_events: UpcomingEvent[]   // next 7 days
}

// ─── M1: User Dashboard ───────────────────────────────────────────────────────

export interface MyDashboardSlot {
  participant_id: number
  slot_name:      string
  balance:        string
  ledger_status:  LedgerStatus
  is_drawn:       boolean
}

export interface MyDashboardVishi {
  vishi_id:      number
  vishi_name:    string
  status:        VishiStatus
  current_cycle: number
  total_cycles:  number
  my_slots:      MyDashboardSlot[]
}

export interface UserDashboard {
  active_vishis:         number
  total_pending_balance: string   // sum of all negative balances
  my_vishis:             MyDashboardVishi[]
}

// ─── M2: Skip Records ─────────────────────────────────────────────────────────

export interface SkipRecord {
  id:         number
  vishi:      number
  skipped_at: string
  reason:     string
  is_auto:    boolean
}

export interface PaginatedSkipRecords {
  count:    number
  next:     string | null
  previous: string | null
  results:  SkipRecord[]
}

// ─── M3: Payments Summary (Admin — cross-vishi) ───────────────────────────────

export interface LedgerSummaryItem {
  ledger_id:        number
  participant_id:   number
  participant_name: string
  mobile_number:    string
  balance:          string
  ledger_status:    LedgerStatus
}

export interface VishiPaymentGroup {
  vishi_id:          number
  vishi_name:        string
  status:            VishiStatus
  total_due:         string   // sum of negative balances
  total_overpaid:    string   // sum of positive balances
  participant_count: number
  due_count:         number
  ledgers:           LedgerSummaryItem[]
}

export interface PaymentsSummary {
  total_outstanding: string   // total across all vishis
  total_overpaid:    string
  vishi_groups:      VishiPaymentGroup[]
}

// ─── M4: User Participations (Admin view of specific user) ────────────────────

export interface UserParticipationSlot {
  participant_id: number
  vishi_id:       number
  vishi_name:     string
  vishi_status:   VishiStatus
  slot_name:      string
  is_active:      boolean
  is_drawn:       boolean
  balance:        string
  ledger_status:  LedgerStatus
  joined_at:      string
}

export interface UserParticipations {
  user_id:        number
  username:       string
  mobile_number:  string
  participations: UserParticipationSlot[]
}

// ─── M5: My Vishis (User grouped view) ───────────────────────────────────────

export interface MyVishiSlot {
  participant_id: number
  slot_name:      string
  is_active:      boolean
  is_drawn:       boolean
  balance:        string
  ledger_status:  LedgerStatus
  draw_cycle:     number | null
  drawn_at:       string | null
}

export interface MyVishiGroup {
  vishi_id:                number
  vishi_name:              string
  amount:                  string
  frequency:               string
  status:                  VishiStatus
  current_cycle:           number
  total_cycles:            number
  current_draw_date:       string
  current_collection_date: string
  current_release_date:    string
  my_slots:                MyVishiSlot[]
}

export interface MyVishis {
  count:   number
  results: MyVishiGroup[]
}

// ─── M6: My Payments (User grouped by vishi) ─────────────────────────────────

export interface MyPaymentEntry {
  entry_id:     number
  amount:       string
  entry_type:   EntryType
  cycle_number: number
  note:         string
  created_at:   string
}

export interface MyVishiPaymentGroup {
  vishi_id:       number
  vishi_name:     string
  participant_id: number
  slot_name:      string
  balance:        string
  ledger_status:  LedgerStatus
  entries:        MyPaymentEntry[]
}

export interface MyPayments {
  total_pending_balance: string
  groups:                MyVishiPaymentGroup[]
}
