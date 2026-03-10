// hooks/useLedgers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ledgerService } from '@/services/ledgerService'
import { VISHI_KEYS } from '@/hooks/useVishis'
import type {
  RecordPaymentPayload,
  LedgersQueryParams,
  EntriesQueryParams,
} from '@/models/ledger'


export const LEDGER_KEYS = {
  all:     (vishiId: number) => ['ledgers', vishiId] as const,
  list:    (vishiId: number, params?: object) =>
    ['ledgers', vishiId, 'list', params ?? {}] as const,
  detail:  (vishiId: number, ledgerId: number) =>
    ['ledgers', vishiId, ledgerId] as const,
  entries: (vishiId: number, ledgerId: number, params?: object) =>
    ['ledgers', vishiId, ledgerId, 'entries', params ?? {}] as const,
}


export function useLedgers(vishiId: number, params?: LedgersQueryParams) {
  return useQuery({
    queryKey: LEDGER_KEYS.list(vishiId, params),
    queryFn:  () => ledgerService.list(vishiId, params).then((r) => r.data),
    enabled:  !!vishiId,
  })
}

// Convenience: only due + active ledgers — used in Payments tab and collect screen
export function useDueLedgers(vishiId: number) {
  return useLedgers(vishiId, { status: 'due', is_active: true })
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
    onSuccess: (res) => {
      // Update ledger cache directly — avoids a full refetch
      qc.setQueryData(LEDGER_KEYS.detail(vishiId, ledgerId), res.data)
      // Invalidate list (balance/status changed) + vishi detail (pending_payments_count)
      qc.invalidateQueries({ queryKey: LEDGER_KEYS.all(vishiId), exact: false })
      qc.invalidateQueries({ queryKey: VISHI_KEYS.detail(vishiId) })
      // Invalidate admin payments summary card
      qc.invalidateQueries({ queryKey: ['payments', 'summary'] })
      toast.success('Payment recorded.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to record payment.'),
  })
}


// ─── Entries ──────────────────────────────────────────────────────────────────
// paymentService was deleted — entries live here in ledgerService


export function usePaymentEntries(
  vishiId:  number,
  ledgerId: number,
  params?:  EntriesQueryParams
) {
  return useQuery({
    queryKey: LEDGER_KEYS.entries(vishiId, ledgerId, params),
    // ← FIXED: was paymentService.list → ledgerService.listEntries
    queryFn:  () => ledgerService.listEntries(vishiId, ledgerId, params).then((r) => r.data),
    enabled:  !!vishiId && !!ledgerId,
  })
}


export function usePaymentEntry(vishiId: number, ledgerId: number, entryId: number) {
  return useQuery({
    queryKey: LEDGER_KEYS.entries(vishiId, ledgerId, { entryId }),
    // ← FIXED: was paymentService.get → ledgerService.getEntry
    queryFn:  () => ledgerService.getEntry(vishiId, ledgerId, entryId).then((r) => r.data),
    enabled:  !!vishiId && !!ledgerId && !!entryId,
  })
}
