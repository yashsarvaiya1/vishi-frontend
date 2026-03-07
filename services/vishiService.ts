// services/vishiService.ts
import api from '@/lib/axios'
import type {
  VishiAdmin,
  VishiPublic,
  CreateVishiPayload,
  UpdateVishiPayload,
  SkipCyclePayload,
  SetFixDrawPayload,
  PaginatedVishis,
  DrawRecord,
} from '@/models/vishi'


export const vishiService = {
  list: (params?: { search?: string; ordering?: string; status?: string; page?: number }) =>
    api.get<PaginatedVishis>('/api/vishis/', { params }),

  get: (id: number) =>
    api.get<VishiAdmin | VishiPublic>(`/api/vishis/${id}/`),

  create: (data: CreateVishiPayload) =>
    api.post<VishiAdmin>('/api/vishis/', data),

  // Only name and amount are writable after creation
  update: (id: number, data: UpdateVishiPayload) =>
    api.patch<VishiAdmin>(`/api/vishis/${id}/`, data),

  // Only allowed when status = 'upcoming'
  delete: (id: number) =>
    api.delete<void>(`/api/vishis/${id}/`),

  // REMOVED: activate() — no such endpoint in backend.
  // Vishi is created with status='active' by default.

  // Requires today >= current_draw_date, status='active'
  draw: (id: number) =>
    api.post<DrawRecord>(`/api/vishis/${id}/draw/`),

  // Requires draw record for current cycle
  release: (id: number) =>
    api.post<DrawRecord>(`/api/vishis/${id}/release/`),

  // url_path='skip_cycle' → /api/vishis/{id}/skip_cycle/
  skipCycle: (id: number, payload?: SkipCyclePayload) =>
    api.post<{ detail: string }>(`/api/vishis/${id}/skip_cycle/`, payload ?? {}),

  // url_path='set_fix_draw' → /api/vishis/{id}/set_fix_draw/
  setFixDraw: (id: number, data: SetFixDrawPayload) =>
    api.post<{ detail: string }>(`/api/vishis/${id}/set_fix_draw/`, data),
}
