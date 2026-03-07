// hooks/useVishis.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vishiService } from '@/services/vishiService'
import type {
  CreateVishiPayload,
  UpdateVishiPayload,
  DrawPayload,
  SkipCyclePayload,
  SetFixDrawPayload,
  VishisQueryParams,
} from '@/models/vishi'


export const VISHI_KEYS = {
  all:         ['vishis'] as const,
  list:        (p: object) => ['vishis', 'list', p] as const,
  detail:      (id: number) => ['vishis', id] as const,
  skipRecords: (id: number) => ['vishis', id, 'skip-records'] as const,  // ← ADDED M2
}


export function useVishis(params?: VishisQueryParams) {
  return useQuery({
    queryKey: VISHI_KEYS.list(params ?? {}),
    queryFn:  () => vishiService.list(params).then((r) => r.data),
  })
}


export function useVishi(id: number) {
  return useQuery({
    queryKey: VISHI_KEYS.detail(id),
    queryFn:  () => vishiService.get(id).then((r) => r.data),
    enabled:  !!id,
  })
}


export function useCreateVishi() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVishiPayload) => vishiService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.all })
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to create vishi.'),
  })
}


export function useUpdateVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateVishiPayload) => vishiService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.all })
      toast.success('Vishi updated.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to update vishi.'),
  })
}


export function useDeleteVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => vishiService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.all })
      toast.success('Vishi deleted.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to delete vishi.'),
  })
}


// ← FIXED: restored — backend DOES have POST /api/vishis/{id}/activate/
// Transitions status: upcoming → active. Required before draw can happen.
export function useActivateVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => vishiService.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.all })
      toast.success('Vishi activated.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to activate vishi.'),
  })
}


// ← FIXED: accepts optional DrawPayload so caller can pass fix_participant_id
export function useDrawVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: DrawPayload) => vishiService.draw(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Draw complete.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Draw failed.'),
  })
}


export function useReleaseVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => vishiService.release(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Funds released.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Release failed.'),
  })
}


export function useSkipCycle(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: SkipCyclePayload) => vishiService.skipCycle(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      // Skip records list also changes
      qc.invalidateQueries({ queryKey: VISHI_KEYS.skipRecords(id) })
      toast.success('Cycle skipped.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to skip cycle.'),
  })
}


// ← FIXED: accepts number | null — null clears the fix draw
export function useSetFixDraw(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participant_id: number | null) =>
      vishiService.setFixDraw(id, { participant_id: participant_id ?? undefined }),
    onSuccess: (_data, participant_id) => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      toast.success(participant_id ? 'Fix draw set.' : 'Fix draw cleared.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to set fix draw.'),
  })
}


// M2 — skip audit trail for Draw History tab inside vishi detail
export function useSkipRecords(vishiId: number) {
  return useQuery({
    queryKey: VISHI_KEYS.skipRecords(vishiId),
    queryFn:  () => vishiService.listSkipRecords(vishiId).then((r) => r.data),
    enabled:  !!vishiId,
  })
}
