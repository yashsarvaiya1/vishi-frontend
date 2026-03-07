// services/paymentService.ts

import api from '@/lib/axios'
import type { PaginatedEntries, PaymentEntry } from '@/models/ledger'

export const paymentService = {
  list: (vishiId: number, ledgerId: number, params?: { search?: string; ordering?: string }) =>
    api.get<PaginatedEntries>(
      `/api/vishis/${vishiId}/ledgers/${ledgerId}/entries/`, { params }
    ),

  get: (vishiId: number, ledgerId: number, entryId: number) =>
    api.get<PaymentEntry>(
      `/api/vishis/${vishiId}/ledgers/${ledgerId}/entries/${entryId}/`
    ),
}
