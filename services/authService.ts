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
import type { User } from '@/models/user'
import type { UpdateProfilePayload } from '@/models/user'


export const authService = {
  checkNumber: (data: CheckNumberRequest) =>
    api.post<CheckNumberResponse>('/api/auth/check-number/', data),

  setPassword: (data: SetPasswordRequest) =>
    api.post<AuthResponse>('/api/auth/set-password/', data),

  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/auth/login/', data),

  clearMyPassword: () =>
    api.post<{ detail: string }>('/api/profile/clear-my-password/'),

  getMe: () =>
    api.get<User>('/api/profile/me/'),

  // FIXED: was /api/profile/me/update/ — wrong
  // Backend action: url_path='me-update' → /api/profile/me-update/
  updateMe: (data: UpdateProfilePayload) =>
    api.patch<User>('/api/profile/me-update/', data),
}
