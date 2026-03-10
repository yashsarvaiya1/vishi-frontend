// services/ledgerService.ts

import api from '@/lib/axios'
import type {
  CollectionLedger,
  PaginatedLedgers,
  PaymentEntry,
  PaginatedEntries,
  RecordPaymentPayload,
  LedgersQueryParams,
  EntriesQueryParams,
} from '@/models/ledger'


export const ledgerService = {
  // ─── Ledgers ──────────────────────────────────────────────────────────────────

  // GET /api/vishis/{vishi_pk}/ledgers/?status=due&is_active=true
  list: (vishiId: number, params?: LedgersQueryParams) =>
    api.get<PaginatedLedgers>(`/api/vishis/${vishiId}/ledgers/`, { params }),

  // GET /api/vishis/{vishi_pk}/ledgers/{id}/
  get: (vishiId: number, ledgerId: number) =>
    api.get<CollectionLedger>(`/api/vishis/${vishiId}/ledgers/${ledgerId}/`),

  // POST /api/vishis/{vishi_pk}/ledgers/{id}/record-payment/  ← FIXED: was record_payment
  recordPayment: (vishiId: number, ledgerId: number, data: RecordPaymentPayload) =>
    api.post<CollectionLedger>(
      `/api/vishis/${vishiId}/ledgers/${ledgerId}/record-payment/`, data
    ),

  // ─── Payment Entries ──────────────────────────────────────────────────────────

  // GET /api/vishis/{vishi_pk}/ledgers/{ledger_pk}/entries/?entry_type=&cycle_number=
  listEntries: (vishiId: number, ledgerId: number, params?: EntriesQueryParams) =>
    api.get<PaginatedEntries>(
      `/api/vishis/${vishiId}/ledgers/${ledgerId}/entries/`, { params }
    ),

  // GET /api/vishis/{vishi_pk}/ledgers/{ledger_pk}/entries/{id}/
  getEntry: (vishiId: number, ledgerId: number, entryId: number) =>
    api.get<PaymentEntry>(
      `/api/vishis/${vishiId}/ledgers/${ledgerId}/entries/${entryId}/`
    ),
}
