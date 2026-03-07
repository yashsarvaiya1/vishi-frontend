// hooks/usePayments.ts

import { useQuery } from '@tanstack/react-query'
import { paymentService } from '@/services/paymentService'


export const PAYMENT_KEYS = {
  // FIXED: params included in queryKey
  list:   (vishiId: number, ledgerId: number, params?: object) =>
    ['entries', vishiId, ledgerId, params ?? {}] as const,
  detail: (vishiId: number, ledgerId: number, entryId: number) =>
    ['entries', vishiId, ledgerId, entryId] as const,
}


export function usePaymentEntries(
  vishiId:  number,
  ledgerId: number,
  params?:  { search?: string; ordering?: string }
) {
  return useQuery({
    queryKey: PAYMENT_KEYS.list(vishiId, ledgerId, params),  // FIXED: was missing params
    queryFn:  () => paymentService.list(vishiId, ledgerId, params).then((r) => r.data),
    enabled:  !!vishiId && !!ledgerId,
  })
}


// NEW: single entry fetch
export function usePaymentEntry(vishiId: number, ledgerId: number, entryId: number) {
  return useQuery({
    queryKey: PAYMENT_KEYS.detail(vishiId, ledgerId, entryId),
    queryFn:  () => paymentService.get(vishiId, ledgerId, entryId).then((r) => r.data),
    enabled:  !!vishiId && !!ledgerId && !!entryId,
  })
}
