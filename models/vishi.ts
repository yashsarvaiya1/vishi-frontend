// models/vishi.ts

export type VishiFrequency = 'weekly' | 'half_monthly' | 'monthly' | 'halfyear' | 'yearly'
export type VishiStatus    = 'upcoming' | 'active' | 'completed'
export type LedgerStatus   = 'paid' | 'due' | 'overpaid'
export type EntryType      = 'charge' | 'payment'

// ─── Paginated ────────────────────────────────────────────────────────────────

export interface PaginatedVishis<T = VishiAdmin | VishiPublic> {
  count:    number
  next:     string | null
  previous: string | null
  results:  T[]
}

// ─── Nested user snapshot ─────────────────────────────────────────────────────

export interface UserDetail {
  id:            number
  username:      string
  mobile_number: string
}

// ─── Participants ─────────────────────────────────────────────────────────────

export interface VishiParticipantAdmin {
  id:            number
  vishi:         number
  user:          number
  user_detail:   UserDetail
  vishi_name:    string
  is_active:     boolean
  is_drawn:      boolean
  joined_at:     string
  ledger_balance: string | null   // ← ADDED: "-4000.00" | "0.00"
  ledger_status:  LedgerStatus | null  // ← ADDED: for participant card badge
}

export interface VishiParticipantPublic {
  id:           number
  vishi_name:   string
  username:     string
  is_drawn:     boolean
  is_active:    boolean
  drawn_at:     string | null
  cycle_number: number | null
}

// ─── Draw records ─────────────────────────────────────────────────────────────

export interface DrawRecord {
  id:               number
  vishi:            number
  participant:      number
  cycle_number:     number
  was_fixed:        boolean
  drawn_at:         string
  is_released:      boolean
  released_at:      string | null
  released_amount:  string | null
  participant_name: string   // ← ADDED: "Raj-Shop"
  username:         string   // ← ADDED: "Raj Shah"
}

export interface DrawRecordPublic {
  cycle_number:    number
  vishi_name:      string
  username:        string
  was_fixed:       boolean
  drawn_at:        string
  is_released:     boolean
  released_at:     string | null
  released_amount: string | null  // ← ADDED: visible in public serializer too
}

// ─── Vishi Base ───────────────────────────────────────────────────────────────

interface VishiBase {
  id:                      number
  name:                    string
  amount:                  string
  frequency:               VishiFrequency
  current_draw_date:       string
  current_collection_date: string
  current_release_date:    string
  start_date:              string
  finish_date:             string
  status:                  VishiStatus
  current_cycle:           number
  total_cycles:            number
}

export interface VishiPublic extends VishiBase {
  participants: VishiParticipantPublic[]
  draw_records: DrawRecordPublic[]
}

export interface VishiAdmin extends VishiBase {
  draw_day:               number
  collection_day:         number
  release_day:            number
  missed_cycles:          number
  fix_draw_participant:   number | null
  is_deleted:             boolean         // ← ADDED
  deleted_at:             string | null   // ← ADDED
  pending_payments_count: number          // ← ADDED: for dashboard badge
  created_by:             number
  created_at:             string
  updated_at:             string
  participants:           VishiParticipantAdmin[]
  draw_records:           DrawRecord[]
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateVishiPayload {
  name:           string
  amount:         string
  frequency:      VishiFrequency
  draw_day:       number
  collection_day: number
  release_day:    number
  start_date:     string
}

// Active vishi: only name. Upcoming: all fields.
export interface UpdateVishiPayload {
  name?:          string
  amount?:        string
  frequency?:     VishiFrequency
  draw_day?:      number
  collection_day?: number
  release_day?:   number
  start_date?:    string
}

export interface CreateParticipantPayload {
  user:        number
  vishi_name?: string
}

export interface UpdateParticipantPayload {
  user?:       number
  vishi_name?: string
}

export interface DrawPayload {
  fix_participant_id?: number   // optional — omit for random draw
}

export interface SkipCyclePayload {
  reason?: string
}

export interface SetFixDrawPayload {
  participant_id?: number   // omit or null to CLEAR the fix draw
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface VishisQueryParams {
  status?:     VishiStatus
  frequency?:  VishiFrequency
  is_deleted?: boolean
  search?:     string
  ordering?:   string
  page?:       number
}

export interface ParticipantsQueryParams {
  is_active?: boolean
  is_drawn?:  boolean
  search?:    string
}

