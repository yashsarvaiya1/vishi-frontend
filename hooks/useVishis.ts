// hooks/useVishis.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vishiService } from '@/services/vishiService'
import type {
  CreateVishiPayload,
  UpdateVishiPayload,
  SkipCyclePayload,
  SetFixDrawPayload,
} from '@/models/vishi'


export const VISHI_KEYS = {
  all:    ['vishis'] as const,
  list:   (p: object) => ['vishis', 'list', p] as const,
  detail: (id: number) => ['vishis', id] as const,
}


export function useVishis(params?: {
  search?: string; ordering?: string; status?: string; page?: number
}) {
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
      // FIXED: removed misleading "Add participants to activate it" —
      // vishi starts as 'active' by default. Caller shows final toast.
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
      toast.error(err?.response?.data?.detail ?? 'Only upcoming vishis can be deleted.'),
  })
}

// REMOVED: useActivateVishi — /api/vishis/{id}/activate/ does NOT exist.
// Vishi defaults to status='active' on creation. No activation step needed.


export function useDrawVishi(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => vishiService.draw(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
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
      toast.success('Cycle skipped.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to skip cycle.'),
  })
}


export function useSetFixDraw(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participant_id: number) =>
      vishiService.setFixDraw(id, { participant_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(id) })
      toast.success('Fix draw set.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to set fix draw.'),
  })
}
