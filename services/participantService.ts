// services/participantService.ts

import api from '@/lib/axios'
import type { VishiParticipantAdmin, VishiParticipantPublic } from '@/models/vishi'

export const participantService = {
  list: (vishiId: number, params?: { search?: string; ordering?: string }) =>
    api.get<{ count: number; results: (VishiParticipantAdmin | VishiParticipantPublic)[] }>(
      `/api/vishis/${vishiId}/participants/`, { params }
    ),

  get: (vishiId: number, participantId: number) =>
    api.get<VishiParticipantAdmin | VishiParticipantPublic>(
      `/api/vishis/${vishiId}/participants/${participantId}/`
    ),

  create: (vishiId: number, data: { user: number; vishi_name?: string }) =>
    api.post<VishiParticipantAdmin>(`/api/vishis/${vishiId}/participants/`, data),

  update: (vishiId: number, participantId: number, data: { user?: number; vishi_name?: string }) =>
    api.patch<VishiParticipantAdmin>(
      `/api/vishis/${vishiId}/participants/${participantId}/`, data
    ),

  remove: (vishiId: number, participantId: number) =>
    api.delete(`/api/vishis/${vishiId}/participants/${participantId}/`),
}
