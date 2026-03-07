// hooks/useParticipants.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
// ← FIXED: participantService deleted — import from vishiService directly
import { vishiService } from '@/services/vishiService'
import { VISHI_KEYS } from '@/hooks/useVishis'
import type {
  CreateParticipantPayload,
  UpdateParticipantPayload,
  ParticipantsQueryParams,
} from '@/models/vishi'


export const PARTICIPANT_KEYS = {
  list:   (vishiId: number, params?: object) =>
    ['participants', vishiId, params ?? {}] as const,
  detail: (vishiId: number, id: number) =>
    ['participants', vishiId, id] as const,
}


export function useParticipants(vishiId: number, params?: ParticipantsQueryParams) {
  return useQuery({
    queryKey: PARTICIPANT_KEYS.list(vishiId, params),
    // ← FIXED: was participantService.list → vishiService.listParticipants
    queryFn:  () => vishiService.listParticipants(vishiId, params).then((r) => r.data),
    enabled:  !!vishiId,
  })
}


export function useAddParticipant(vishiId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateParticipantPayload) =>
      // ← FIXED: was participantService.create → vishiService.addParticipant
      vishiService.addParticipant(vishiId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PARTICIPANT_KEYS.list(vishiId) })
      // total_cycles + finish_date on vishi change when participant is added
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
    mutationFn: (data: UpdateParticipantPayload) =>
      // ← FIXED: was participantService.update → vishiService.updateParticipant
      vishiService.updateParticipant(vishiId, participantId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PARTICIPANT_KEYS.list(vishiId) })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      toast.success('Participant updated.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to update participant.'),
  })
}


export function useRemoveParticipant(vishiId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participantId: number) =>
      // ← FIXED: was participantService.remove → vishiService.removeParticipant
      vishiService.removeParticipant(vishiId, participantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PARTICIPANT_KEYS.list(vishiId) })
      // total_cycles + finish_date change on non-drawn participant removal
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      toast.success('Participant removed.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to remove participant.'),
  })
}
