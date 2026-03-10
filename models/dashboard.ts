// models/dashboard.ts

import type { VishiFrequency, VishiStatus, LedgerStatus } from './vishi'
import type { CollectionLedger, PaymentEntry }            from './ledger'


// ─── M1: Admin Dashboard ──────────────────────────────────────────────────────
// Aligns with backend DashboardSerializer + DashboardActionSerializer


export type AlertType = 'draw_overdue' | 'release_pending' | 'payments_pending'


export interface ActionAlert {
  vishi_id:   number
  vishi_name: string
  action:     AlertType   // ← FIXED: was `type`, backend returns `action`
  detail:     string      // human-readable label e.g. "Draw overdue by 3 days"
  // NOTE: days_overdue / pending_count removed — backend embeds them in `detail` string
}


export interface UpcomingEvent {
  date:       string
  vishi_id:   number
  vishi_name: string
  event_type: 'draw' | 'collection' | 'release'
}


export interface AdminDashboard {
  active_vishis_count:   number          // ← FIXED: was active_vishis
  upcoming_vishis_count: number          // ← FIXED: was upcoming_vishis
  total_members:         number          // total active VishiParticipant distinct users
  total_users:           number          // total active non-superuser Users
  action_required:       ActionAlert[]   // ← FIXED: was action_alerts
  upcoming_this_week:    UpcomingEvent[] // ← FIXED: was upcoming_events
}


// NOTE: No UserDashboard API endpoint exists.
// The user home screen is DERIVED on the frontend from:
//   - GET /api/profile/me/vishis/  → MyVishiGroup[]   (M5)
//   - GET /api/profile/me/payments/ → MyPaymentVishiGroup[]  (M6)
// Use this frontend-computed shape in the Home screen component:
export interface UserHomeDerived {
  active_vishis_count:   number    // derived: filter my_slots with status=active
  total_pending_balance: string    // derived: sum of negative balances across all groups
  my_vishis:             MyVishiGroup[]
}


// ─── M2: Skip Records ─────────────────────────────────────────────────────────
// Aligns with backend SkipRecordSerializer


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
// Aligns with backend PaymentsSummarySerializer + PaymentVishiBreakdownSerializer


export interface VishiPaymentGroup {
  vishi_id:         number
  vishi_name:       string
  total_due:        string              // sum of abs(negative balances) for due ledgers
  due_participants: number              // ← FIXED: was due_count
  ledgers:          CollectionLedger[]  // ← FIXED: full CollectionLedger objects (imported)
  // REMOVED: status, total_overpaid, participant_count — not in backend serializer
}


export interface PaymentsSummary {
  total_outstanding: string              // total across all vishis
  total_due_count:   number             // ← FIXED: was total_overpaid (wrong concept)
  by_vishi:          VishiPaymentGroup[] // ← FIXED: was vishi_groups
}


// ─── M4: User Participations (Admin view of specific user) ────────────────────
// Aligns with backend UserParticipationSlotSerializer
// NOTE: Backend returns a FLAT ARRAY — not a wrapped object


export interface DrawRecordSnapshot {
  cycle_number:    number
  drawn_at:        string
  was_fixed:       boolean
  is_released:     boolean
  released_at:     string | null
  released_amount: string | null
}


export interface UserParticipationSlot {
  id:              number           // ← FIXED: was participant_id — backend uses `id`
  vishi_id:        number
  vishi_name_full: string           // the Vishi's name e.g. "Family Vishi 2026"
  vishi_status:    VishiStatus
  vishi_name:      string           // the SLOT name e.g. "Raj-Home" (same field name as backend)
  is_active:       boolean
  is_drawn:        boolean
  joined_at:       string
  ledger_balance:  string | null    // ← FIXED: was `balance`
  ledger_status:   LedgerStatus | null
  draw_record:     DrawRecordSnapshot | null
}

// Backend returns UserParticipationSlot[] directly — no wrapper object
// REMOVED: UserParticipations wrapper interface


// ─── M5: My Vishis (User grouped view) ───────────────────────────────────────
// Aligns with backend MyVishiSlotSerializer + MyVishiGroupedSerializer
// NOTE: Backend returns MyVishiGroup[] — plain array, NOT paginated


export interface MyVishiDrawRecord {
  cycle_number:    number
  drawn_at:        string
  is_released:     boolean
  released_amount: string | null
}


export interface MyVishiSlot {
  id:             number           // ← FIXED: was participant_id
  vishi_name:     string           // slot name e.g. "Raj-Home"
  is_active:      boolean
  is_drawn:       boolean
  joined_at:      string
  ledger_balance: string | null    // ← FIXED: was `balance`
  ledger_status:  LedgerStatus | null
  draw_record:    MyVishiDrawRecord | null
  // REMOVED: draw_cycle, drawn_at (they're nested inside draw_record now)
}


export interface MyVishiGroup {
  vishi_id:                number
  vishi_name:              string
  amount:                  string
  frequency:               VishiFrequency
  status:                  VishiStatus
  current_cycle:           number
  total_cycles:            number
  current_draw_date:       string
  current_collection_date: string
  current_release_date:    string
  my_slots:                MyVishiSlot[]
  total_balance:           string    // sum across all my slots
  has_due:                 boolean   // true if any slot has status='due'
}

// Backend returns MyVishiGroup[] directly — plain array
// REMOVED: MyVishis wrapper { count, results } — no pagination on this endpoint


// ─── M6: My Payments (User grouped by vishi) ─────────────────────────────────
// Aligns with backend MyPaymentVishiSerializer
// NOTE: Backend returns MyPaymentVishiGroup[] — plain array, NOT paginated


export interface MyPaymentSlot {
  slot_name: string
  balance:   string
  status:    LedgerStatus
  entries:   PaymentEntry[]  // ← imported from ledger.ts
}


export interface MyPaymentVishiGroup {
  vishi_id:      number
  vishi_name:    string
  vishi_status:  VishiStatus
  total_balance: string        // sum across all slots for this vishi
  slots:         MyPaymentSlot[]
}

// Backend returns MyPaymentVishiGroup[] directly — plain array
// REMOVED: MyPayments wrapper { total_pending_balance, groups }
// Derive total_pending_balance on the frontend by summing negative total_balance values
