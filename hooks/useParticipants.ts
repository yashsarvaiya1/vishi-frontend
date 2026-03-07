// hooks/useParticipants.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { participantService } from '@/services/participantService'
import { VISHI_KEYS } from './useVishis'


export const PARTICIPANT_KEYS = {
  list: (vishiId: number) => ['participants', vishiId] as const,
}


export function useParticipants(vishiId: number, params?: { search?: string; ordering?: string }) {
  return useQuery({
    queryKey: PARTICIPANT_KEYS.list(vishiId),
    queryFn:  () => participantService.list(vishiId, params).then((r) => r.data),
    enabled:  !!vishiId,
  })
}


export function useAddParticipant(vishiId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { user: number; vishi_name?: string }) =>
      participantService.create(vishiId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PARTICIPANT_KEYS.list(vishiId) })
      // total_cycles + finish_date on vishi changes when participant added
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      toast.success('Participant added.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to add participant.'),
  })
}


export function useUpdateParticipant(vishiId: number, participantId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { user?: number; vishi_name?: string }) =>
      participantService.update(vishiId, participantId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PARTICIPANT_KEYS.list(vishiId) })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      toast.success('Participant updated.')
    },
    // FIXED: was missing onError
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to update participant.'),
  })
}


export function useRemoveParticipant(vishiId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participantId: number) =>
      participantService.remove(vishiId, participantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PARTICIPANT_KEYS.list(vishiId) })
      // total_cycles + finish_date on vishi changes when participant removed
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      toast.success('Participant removed.')
    },
    // FIXED: was missing onError
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to remove participant.'),
  })
}
