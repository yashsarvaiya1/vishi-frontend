// services/vishiService.ts

import api from '@/lib/axios'
import type {
  VishiAdmin,
  VishiPublic,
  PaginatedVishis,
  DrawRecord,
  CreateVishiPayload,
  UpdateVishiPayload,
  DrawPayload,
  SkipCyclePayload,
  SetFixDrawPayload,
  VishisQueryParams,
  CreateParticipantPayload,
  UpdateParticipantPayload,
  ParticipantsQueryParams,
  VishiParticipantAdmin,
  VishiParticipantPublic,
} from '@/models/vishi'
import type { PaginatedSkipRecords } from '@/models/dashboard'


export const vishiService = {
  // ─── Vishi CRUD ──────────────────────────────────────────────────────────────

  // GET /api/vishis/?status=&frequency=&is_deleted=&search=&ordering=&page=
  list: (params?: VishisQueryParams) =>
    api.get<PaginatedVishis<VishiAdmin | VishiPublic>>('/api/vishis/', { params }),

  // GET /api/vishis/{id}/
  get: (id: number) =>
    api.get<VishiAdmin | VishiPublic>(`/api/vishis/${id}/`),

  // POST /api/vishis/
  create: (data: CreateVishiPayload) =>
    api.post<VishiAdmin>('/api/vishis/', data),

  // PATCH /api/vishis/{id}/
  // Active vishi: only name editable. Upcoming: all fields.
  // Backend validates and rejects locked fields on active vishi.
  update: (id: number, data: UpdateVishiPayload) =>
    api.patch<VishiAdmin>(`/api/vishis/${id}/`, data),

  // DELETE /api/vishis/{id}/
  // Returns 200 + { detail } for soft-delete (active/completed or upcoming with participants)
  // Returns 204 for hard-delete (upcoming with zero participants)
  delete: (id: number) =>
    api.delete<{ detail: string } | void>(`/api/vishis/${id}/`),

  // ─── Vishi Actions ───────────────────────────────────────────────────────────

  // POST /api/vishis/{id}/activate/   ← ADDED BACK: backend does have this endpoint
  // Transitions status: upcoming → active. Requires at least 1 participant.
  activate: (id: number) =>
    api.post<{ detail: string }>(`/api/vishis/${id}/activate/`),

  // POST /api/vishis/{id}/draw/
  // Optional body: { fix_participant_id } — omit for random draw
  draw: (id: number, data?: DrawPayload) =>
    api.post<DrawRecord>(`/api/vishis/${id}/draw/`, data ?? {}),

  // POST /api/vishis/{id}/release/
  release: (id: number) =>
    api.post<DrawRecord>(`/api/vishis/${id}/release/`),

  // POST /api/vishis/{id}/skip-cycle/   ← FIXED: was skip_cycle (underscore)
  skipCycle: (id: number, payload?: SkipCyclePayload) =>
    api.post<{ detail: string }>(`/api/vishis/${id}/skip-cycle/`, payload ?? {}),

  // POST /api/vishis/{id}/set-fix-draw/  ← FIXED: was set_fix_draw (underscore)
  // Send { participant_id } to set, omit participant_id to clear
  setFixDraw: (id: number, data: SetFixDrawPayload) =>
    api.post<{ detail: string }>(`/api/vishis/${id}/set-fix-draw/`, data),

  // ─── Participants ─────────────────────────────────────────────────────────────

  // GET /api/vishis/{vishi_pk}/participants/?is_active=&is_drawn=&search=
  listParticipants: (vishiId: number, params?: ParticipantsQueryParams) =>
    api.get<{ count: number; results: (VishiParticipantAdmin | VishiParticipantPublic)[] }>(
      `/api/vishis/${vishiId}/participants/`, { params }
    ),

  // GET /api/vishis/{vishi_pk}/participants/{id}/
  getParticipant: (vishiId: number, participantId: number) =>
    api.get<VishiParticipantAdmin | VishiParticipantPublic>(
      `/api/vishis/${vishiId}/participants/${participantId}/`
    ),

  // POST /api/vishis/{vishi_pk}/participants/
  addParticipant: (vishiId: number, data: CreateParticipantPayload) =>
    api.post<VishiParticipantAdmin>(`/api/vishis/${vishiId}/participants/`, data),

  // PATCH /api/vishis/{vishi_pk}/participants/{id}/
  updateParticipant: (vishiId: number, participantId: number, data: UpdateParticipantPayload) =>
    api.patch<VishiParticipantAdmin>(
      `/api/vishis/${vishiId}/participants/${participantId}/`, data
    ),

  // DELETE /api/vishis/{vishi_pk}/participants/{id}/  → soft-delete
  removeParticipant: (vishiId: number, participantId: number) =>
    api.delete(`/api/vishis/${vishiId}/participants/${participantId}/`),

  // ─── Skip Records (M2) ───────────────────────────────────────────────────────

  // GET /api/vishis/{id}/skip-records/
  listSkipRecords: (vishiId: number) =>
    api.get<PaginatedSkipRecords>(`/api/vishis/${vishiId}/skip-records/`),
}
