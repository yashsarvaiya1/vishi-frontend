// services/userService.ts

import api from '@/lib/axios'
import type {
  User,
  PaginatedUsers,
  CreateUserPayload,
  UpdateUserPayload,
  UsersQueryParams,
} from '@/models/user'
import type { UserParticipations } from '@/models/dashboard'


export const userService = {
  // GET /api/users/?search=&is_active=&ordering=&page=
  list: (params?: UsersQueryParams) =>
    api.get<PaginatedUsers>('/api/users/', { params }),

  // GET /api/users/{id}/
  get: (id: number) =>
    api.get<User>(`/api/users/${id}/`),

  // POST /api/users/
  create: (data: CreateUserPayload) =>
    api.post<User>('/api/users/', data),

  // PATCH /api/users/{id}/
  // Only send safe fields — never send is_superuser, is_staff, is_active via this method
  update: (id: number, data: UpdateUserPayload) => {
    const safe: UpdateUserPayload = {}
    if (data.username            !== undefined) safe.username            = data.username
    if (data.address             !== undefined) safe.address             = data.address
    if (data.mobile_number       !== undefined) safe.mobile_number       = data.mobile_number
    if (data.additional_contacts !== undefined) safe.additional_contacts = data.additional_contacts
    return api.patch<User>(`/api/users/${id}/`, safe)
  },

  // DELETE /api/users/{id}/ → soft-delete (sets is_active=false)
  deactivate: (id: number) =>
    api.delete<{ detail: string }>(`/api/users/${id}/`),

  // POST /api/users/{id}/activate/
  activate: (id: number) =>
    api.post<{ detail: string }>(`/api/users/${id}/activate/`),

  // POST /api/users/{id}/clear-password/   ← FIXED: was clear_password (underscore)
  clearPassword: (id: number) =>
    api.post<{ detail: string }>(`/api/users/${id}/clear-password/`),

  // GET /api/users/{id}/participations/    ← ADDED: M4 — admin view of user's all slots + balances
  getParticipations: (id: number) =>
    api.get<UserParticipations>(`/api/users/${id}/participations/`),
}
