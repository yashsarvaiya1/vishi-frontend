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
  date_joined:         string
  last_login:          string | null
  password_set:        boolean
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

// PATCH /api/users/{id}/ — superuser only
export interface UpdateUserPayload {
  username?:            string
  address?:             string
  mobile_number?:       string
  additional_contacts?: AdditionalContact[]
}

// PATCH /api/profile/me/update/ — all users
export interface UpdateProfilePayload {
  username?:            string
  address?:             string
  additional_contacts?: AdditionalContact[]
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface UsersQueryParams {
  search?:    string
  is_active?: boolean
  ordering?:  'date_joined' | '-date_joined' | 'username' | 'mobile_number'
  page?:      number
  page_size?: number   // passed as ?page_size=500 to fetch all active users in one call
}
