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
  skipRecords: (id: number) => ['vishis', id, 'skip-records'] as const,
}

// ─── Extracts the most useful error message from an API error ─────────────────
// Backend can return: { detail: "..." } | { field: ["..."] } | { non_field_errors: ["..."] }
function extractError(err: any, fallback: string): string {
  const data = err?.response?.data
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (data.non_field_errors?.length) return data.non_field_errors[0]
  // First field error
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const val = data[firstKey]
    return Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val)
  }
  return fallback
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
      toast.success('Vishi created.')
    },
    onError: (err: any) => toast.error(extractError(err, 'Failed to create vishi.')),
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
    onError: (err: any) => toast.error(extractError(err, 'Failed to update vishi.')),
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
    onError: (err: any) => toast.error(extractError(err, 'Failed to delete vishi.')),
  })
}


export function useActivateVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => vishiService.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.all })
      toast.success('Vishi activated.')
    },
    onError: (err: any) => toast.error(extractError(err, 'Failed to activate vishi.')),
  })
}


export function useDrawVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: DrawPayload) => vishiService.draw(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    // ← FIXED: richer error — backend returns "Draw date is 2025-06-01. Cannot draw before that date."
    onError: (err: any) => toast.error(extractError(err, 'Draw failed.')),
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
    onError: (err: any) => toast.error(extractError(err, 'Release failed.')),
  })
}


export function useSkipCycle(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: SkipCyclePayload) => vishiService.skipCycle(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.skipRecords(id) })
      toast.success('Cycle skipped.')
    },
    onError: (err: any) => toast.error(extractError(err, 'Failed to skip cycle.')),
  })
}


export function useSetFixDraw(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participant_id: number | null) =>
      vishiService.setFixDraw(id, { participant_id: participant_id ?? undefined }),
    onSuccess: (_data, participant_id) => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      toast.success(participant_id ? 'Fix draw set.' : 'Fix draw cleared.')
    },
    onError: (err: any) => toast.error(extractError(err, 'Failed to set fix draw.')),
  })
}


export function useSkipRecords(vishiId: number) {
  return useQuery({
    queryKey: VISHI_KEYS.skipRecords(vishiId),
    queryFn:  () => vishiService.listSkipRecords(vishiId).then((r) => r.data),
    enabled:  !!vishiId,
  })
}

export function useRestoreVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => vishiService.restoreVishi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.all })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['payments', 'summary'] })  // ← ADDED: refreshes collect page
      qc.invalidateQueries({ queryKey: ['dashboard'] })             // ← ADDED: refreshes admin home
      toast.success('Vishi restored.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to restore vishi.'),
  })
}

