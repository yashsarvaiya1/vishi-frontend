// services/authService.ts

import api from '@/lib/axios'
import type {
  CheckNumberRequest,
  CheckNumberResponse,
  SetPasswordRequest,
  LoginRequest,
  AuthResponse,
  LoginResponse,
} from '@/models/auth'
import type { User, UpdateProfilePayload } from '@/models/user'


export const authService = {
  // POST /api/auth/check-number/
  checkNumber: (data: CheckNumberRequest) =>
    api.post<CheckNumberResponse>('/api/auth/check-number/', data),

  // POST /api/auth/set-password/
  setPassword: (data: SetPasswordRequest) =>
    api.post<AuthResponse>('/api/auth/set-password/', data),

  // POST /api/auth/login/
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/auth/login/', data),

  // GET /api/profile/me/
  getMe: () =>
    api.get<User>('/api/profile/me/'),

  // PATCH /api/profile/me/update/
  // Backend ProfileViewSet: url_path='me/update' → /api/profile/me/update/  ← correct as-is
  updateMe: (data: UpdateProfilePayload) =>
    api.patch<User>('/api/profile/me/update/', data),

  // POST /api/profile/clear-my-password/
  clearMyPassword: () =>
    api.post<{ detail: string }>('/api/profile/clear-my-password/'),
}
