// hooks/useLedgers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ledgerService } from '@/services/ledgerService'
import { VISHI_KEYS } from './useVishis'
import type { RecordPaymentPayload } from '@/models/ledger'


export const LEDGER_KEYS = {
  all:    (vishiId: number) => ['ledgers', vishiId] as const,
  list:   (vishiId: number, params?: object) => ['ledgers', vishiId, 'list', params ?? {}] as const,
  detail: (vishiId: number, ledgerId: number) => ['ledgers', vishiId, ledgerId] as const,
}


export function useLedgers(vishiId: number, params?: { search?: string; ordering?: string }) {
  return useQuery({
    queryKey: LEDGER_KEYS.list(vishiId, params),
    queryFn:  () => ledgerService.list(vishiId, params).then((r) => r.data),
    enabled:  !!vishiId,
  })
}


export function useLedger(vishiId: number, ledgerId: number) {
  return useQuery({
    queryKey: LEDGER_KEYS.detail(vishiId, ledgerId),
    queryFn:  () => ledgerService.get(vishiId, ledgerId).then((r) => r.data),
    enabled:  !!vishiId && !!ledgerId,
  })
}


export function useRecordPayment(vishiId: number, ledgerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RecordPaymentPayload) =>
      ledgerService.recordPayment(vishiId, ledgerId, data),
    onSuccess: () => {
      // FIXED: use all() prefix key with exact:false so ALL ledger list
      // variants for this vishi are invalidated regardless of params
      qc.invalidateQueries({ queryKey: LEDGER_KEYS.all(vishiId), exact: false })
      qc.invalidateQueries({ queryKey: LEDGER_KEYS.detail(vishiId, ledgerId) })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      toast.success('Payment recorded.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to record payment.'),
  })
}
