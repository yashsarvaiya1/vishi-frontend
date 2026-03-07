// models/user.ts

export interface AdditionalContact {
  name:     string   // "Raj Shah"
  number:   string   // "9876543210"
  relation: string   // "Father"
}

export interface User {
  id:                  number
  mobile_number:       string
  username:            string
  address:             string
  additional_contacts: AdditionalContact[]
  is_active:           boolean
  is_superuser:        boolean
  date_joined:         string        // ISO datetime
  last_login:          string | null
}

// ─── Paginated ────────────────────────────────────────────────────────────────

export interface PaginatedUsers {
  count:    number
  next:     string | null
  previous: string | null
  results:  User[]
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  mobile_number:        string
  username?:            string
  address?:             string
  additional_contacts?: AdditionalContact[]
}

// PATCH /api/users/{id}/ — admin only
export interface UpdateUserPayload {
  username?:            string
  address?:             string
  mobile_number?:       string
  additional_contacts?: AdditionalContact[]
}

// PATCH /api/profile/me-update/ — superuser only
// allowed: username, address, additional_contacts
export interface UpdateProfilePayload {
  username?:            string
  address?:             string
  additional_contacts?: AdditionalContact[]
}
