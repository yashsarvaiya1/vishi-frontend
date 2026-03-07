// models/auth.ts

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface CheckNumberRequest {
  mobile_number: string
}

export interface LoginRequest {
  mobile_number: string
  password:      string
}

export interface SetPasswordRequest {
  mobile_number:    string
  password:         string
  confirm_password: string
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface CheckNumberResponse {
  password_set: boolean
  username:     string | null
}

// POST /api/auth/set-password/ → success
export interface AuthResponse {
  detail:       string
  username:     string | null
  is_superuser: boolean
}

// POST /api/auth/login/ → two possible shapes:
// 1. password not yet set   → { password_set: false }
// 2. successful login       → { detail, username, is_superuser }
export type LoginResponse =
  | { password_set: false }
  | { detail: string; username: string | null; is_superuser: boolean }
