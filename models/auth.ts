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
  id:           number         // ← ADDED
  username:     string | null
  is_superuser: boolean
}

// POST /api/auth/login/ → two possible shapes
export type LoginResponse =
  | { password_set: false }
  | { detail: string; id: number; username: string | null; is_superuser: boolean }  // ← ADDED id

// Shared error shape for all auth endpoints
export interface AuthErrorResponse {
  detail: string
}
