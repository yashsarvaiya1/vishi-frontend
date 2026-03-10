// services/dashboardService.ts

import api from '@/lib/axios'
import type { AdminDashboard }      from '@/models/dashboard'
import type { PaymentsSummary }     from '@/models/dashboard'
import type { MyVishiGroup }        from '@/models/dashboard'
import type { MyPaymentVishiGroup } from '@/models/dashboard'


export const dashboardService = {
  // GET /api/dashboard/
  // M1 — Superuser only
  getAdminDashboard: () =>
    api.get<AdminDashboard>('/api/dashboard/'),

  // GET /api/payments-summary/
  // M3 — Superuser only: cross-vishi grouped payments overview
  // FIXED: was /api/payments/summary/ — correct URL is /api/payments-summary/
  getPaymentsSummary: () =>
    api.get<PaymentsSummary>('/api/payments-summary/'),

  // GET /api/profile/me/vishis/
  // M5 — Any authenticated user. Returns plain array — NOT paginated
  getMyVishis: () =>
    api.get<MyVishiGroup[]>('/api/profile/me/vishis/'),

  // GET /api/profile/me/payments/
  // M6 — Any authenticated user. Returns plain array — NOT paginated
  getMyPayments: () =>
    api.get<MyPaymentVishiGroup[]>('/api/profile/me/payments/'),
}
