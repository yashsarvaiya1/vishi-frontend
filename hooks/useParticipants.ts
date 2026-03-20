// hooks/useParticipants.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vishiService } from '@/services/vishiService'
import { VISHI_KEYS }   from '@/hooks/useVishis'
import { LEDGER_KEYS }  from '@/hooks/useLedgers'
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
    queryFn:  () => vishiService.listParticipants(vishiId, params).then((r) => r.data),
    enabled:  !!vishiId,
  })
}


export function useAddParticipant(vishiId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateParticipantPayload) =>
      vishiService.addParticipant(vishiId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PARTICIPANT_KEYS.list(vishiId) })
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
      vishiService.removeParticipant(vishiId, participantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PARTICIPANT_KEYS.list(vishiId) })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      toast.success('Participant removed.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to remove participant.'),
  })
}


// ─── Charge / Waive ───────────────────────────────────────────────────────────

export function useChargeWaive(vishiId: number, participantId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { action: 'charge' | 'waive'; cycle_number: number; note?: string }) =>
      vishiService.chargeWaive(vishiId, participantId, data),
    onSuccess: (_res, variables) => {
      // Invalidate ledgers so balances refresh in payments tab
      qc.invalidateQueries({ queryKey: LEDGER_KEYS.all(vishiId) })
      // Invalidate vishi detail so pending_payments_count badge updates
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      // Invalidate payments summary card
      qc.invalidateQueries({ queryKey: ['payments', 'summary'] })
      // Invalidate my-vishis/my-payments for the affected user
      qc.invalidateQueries({ queryKey: ['profile', 'my-vishis'] })
      qc.invalidateQueries({ queryKey: ['profile', 'my-payments'] })
      toast.success(
        variables.action === 'charge'
          ? `Charged for cycle ${variables.cycle_number}.`
          : `Waived cycle ${variables.cycle_number}.`
      )
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Operation failed.'),
  })
}
