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

// ─── Nested user snapshot (admin serializer only) ─────────────────────────────

export interface UserDetail {
  id:            number
  username:      string
  mobile_number: string
}

// ─── Participants ─────────────────────────────────────────────────────────────

/** Admin: GET /api/vishis/{id}/participants/ — full fields */
export interface VishiParticipantAdmin {
  id:          number
  vishi:       number
  user:        number       // FK id
  user_detail: UserDetail   // nested read-only
  vishi_name:  string
  is_active:   boolean
  is_drawn:    boolean
  joined_at:   string
}

/** User: GET /api/vishis/{id}/participants/ — limited public fields */
export interface VishiParticipantPublic {
  id:           number
  vishi_name:   string
  username:     string       // source: user.username
  is_drawn:     boolean
  is_active:    boolean
  drawn_at:     string | null   // from VishiDrawRecord
  cycle_number: number | null   // from VishiDrawRecord
}

// ─── Draw records ─────────────────────────────────────────────────────────────

/** Admin: fields = '__all__' */
export interface DrawRecord {
  id:              number
  vishi:           number
  participant:     number
  cycle_number:    number
  was_fixed:       boolean
  drawn_at:        string
  is_released:     boolean
  released_at:     string | null
  released_amount: string | null   // decimal string e.g. "25000.00"
}

/** User: limited public serializer — NO released_amount */
export interface DrawRecordPublic {
  cycle_number: number
  vishi_name:   string
  username:     string
  was_fixed:    boolean
  drawn_at:     string
  is_released:  boolean
  released_at:  string | null
}

// ─── Vishi (shared base) ──────────────────────────────────────────────────────

interface VishiBase {
  id:                      number
  name:                    string
  amount:                  string   // "5000.00"
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

/** Regular user response — VishiPublicSerializer */
export interface VishiPublic extends VishiBase {
  participants: VishiParticipantPublic[]
  draw_records: DrawRecordPublic[]
}

/** Superuser response — VishiSerializer (fields = '__all__') */
export interface VishiAdmin extends VishiBase {
  draw_day:             number
  collection_day:       number
  release_day:          number
  missed_cycles:        number
  fix_draw_participant: number | null  // FK id or null
  created_by:           number
  created_at:           string
  updated_at:           string
  participants:         VishiParticipantAdmin[]
  draw_records:         DrawRecord[]
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

/** Only name and amount are writable after creation */
export interface UpdateVishiPayload {
  name?:   string
  amount?: string
}

export interface CreateParticipantPayload {
  user:        number
  vishi_name?: string
}

export interface UpdateParticipantPayload {
  user?:       number
  vishi_name?: string
}

/** POST /api/vishis/{id}/skip_cycle/ */
export interface SkipCyclePayload {
  reason?: string   // optional audit note
}

/** POST /api/vishis/{id}/set_fix_draw/ */
export interface SetFixDrawPayload {
  participant_id: number
}
