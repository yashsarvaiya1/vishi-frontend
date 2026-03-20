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
import type { CollectionLedger }     from '@/models/ledger'


export const vishiService = {
  // ─── Vishi CRUD ──────────────────────────────────────────────────────────────

  list: (params?: VishisQueryParams) =>
    api.get<PaginatedVishis<VishiAdmin | VishiPublic>>('/api/vishis/', { params }),

  get: (id: number) =>
    api.get<VishiAdmin | VishiPublic>(`/api/vishis/${id}/`),

  create: (data: CreateVishiPayload) =>
    api.post<VishiAdmin>('/api/vishis/', data),

  update: (id: number, data: UpdateVishiPayload) =>
    api.patch<VishiAdmin>(`/api/vishis/${id}/`, data),

  delete: (id: number) =>
    api.delete<{ detail: string } | void>(`/api/vishis/${id}/`),

  // ─── Vishi Actions ───────────────────────────────────────────────────────────

  activate: (id: number) =>
    api.post<{ detail: string }>(`/api/vishis/${id}/activate/`),

  draw: (id: number, data?: DrawPayload) =>
    api.post<DrawRecord>(`/api/vishis/${id}/draw/`, data ?? {}),

  release: (id: number) =>
    api.post<DrawRecord>(`/api/vishis/${id}/release/`),

  skipCycle: (id: number, payload?: SkipCyclePayload) =>
    api.post<{ detail: string }>(`/api/vishis/${id}/skip-cycle/`, payload ?? {}),

  setFixDraw: (id: number, data: SetFixDrawPayload) =>
    api.post<{ detail: string }>(`/api/vishis/${id}/set-fix-draw/`, data),

  // ─── Participants ─────────────────────────────────────────────────────────────

  listParticipants: (vishiId: number, params?: ParticipantsQueryParams) =>
    api.get<{ count: number; results: (VishiParticipantAdmin | VishiParticipantPublic)[] }>(
      `/api/vishis/${vishiId}/participants/`, { params }
    ),

  getParticipant: (vishiId: number, participantId: number) =>
    api.get<VishiParticipantAdmin | VishiParticipantPublic>(
      `/api/vishis/${vishiId}/participants/${participantId}/`
    ),

  addParticipant: (vishiId: number, data: CreateParticipantPayload) =>
    api.post<VishiParticipantAdmin>(`/api/vishis/${vishiId}/participants/`, data),

  updateParticipant: (vishiId: number, participantId: number, data: UpdateParticipantPayload) =>
    api.patch<VishiParticipantAdmin>(
      `/api/vishis/${vishiId}/participants/${participantId}/`, data
    ),

  removeParticipant: (vishiId: number, participantId: number) =>
    api.delete(`/api/vishis/${vishiId}/participants/${participantId}/`),

  // ─── Charge / Waive (per participant, per cycle) ─────────────────────────────
  // POST /api/vishis/{vishi_pk}/participants/{pk}/charge-waive/
  // body: { action: 'charge' | 'waive', cycle_number: number, note?: string }

  chargeWaive: (
    vishiId:       number,
    participantId: number,
    data: { action: 'charge' | 'waive'; cycle_number: number; note?: string }
  ) =>
    api.post<CollectionLedger>(
      `/api/vishis/${vishiId}/participants/${participantId}/charge-waive/`, data
    ),

  // ─── Skip Records (M2) ───────────────────────────────────────────────────────

  listSkipRecords: (vishiId: number) =>
    api.get<PaginatedSkipRecords>(`/api/vishis/${vishiId}/skip-records/`),
}
