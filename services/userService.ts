// services/userService.ts

import api from '@/lib/axios'
import type {
  User, CreateUserPayload,
  UpdateUserPayload, PaginatedUsers,
} from '@/models/user'

export const userService = {
  list: (params?: { search?: string; ordering?: string; page?: number }) =>
    api.get<PaginatedUsers>('/api/users/', { params }),

  get: (id: number) =>
    api.get<User>(`/api/users/${id}/`),

  create: (data: CreateUserPayload) =>
    api.post<User>('/api/users/', data),

  update: (id: number, data: UpdateUserPayload) => {
    // only send safe fields — never send is_superuser, is_staff, is_active
    const safe: UpdateUserPayload = {}
    if (data.username  !== undefined) safe.username  = data.username
    if (data.address   !== undefined) safe.address   = data.address
    if (data.mobile_number !== undefined) safe.mobile_number = data.mobile_number
    if (data.additional_contacts !== undefined) safe.additional_contacts = data.additional_contacts
    return api.patch<User>(`/api/users/${id}/`, safe)
  },

  deactivate: (id: number) =>
    api.delete<{ detail: string }>(`/api/users/${id}/`),

  activate: (id: number) =>
    api.post<{ detail: string }>(`/api/users/${id}/activate/`),

  clearPassword: (id: number) =>
    api.post<{ detail: string }>(`/api/users/${id}/clear_password/`),
}
