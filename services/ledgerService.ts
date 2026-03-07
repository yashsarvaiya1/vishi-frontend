// services/ledgerService.ts

import api from '@/lib/axios'
import type { CollectionLedger, PaginatedLedgers, RecordPaymentPayload } from '@/models/ledger'

export const ledgerService = {
  list: (vishiId: number, params?: { search?: string; ordering?: string }) =>
    api.get<PaginatedLedgers>(`/api/vishis/${vishiId}/ledgers/`, { params }),

  get: (vishiId: number, ledgerId: number) =>
    api.get<CollectionLedger>(`/api/vishis/${vishiId}/ledgers/${ledgerId}/`),

  recordPayment: (vishiId: number, ledgerId: number, data: RecordPaymentPayload) =>
    api.post<CollectionLedger>(
      `/api/vishis/${vishiId}/ledgers/${ledgerId}/record_payment/`, data
    ),
}
