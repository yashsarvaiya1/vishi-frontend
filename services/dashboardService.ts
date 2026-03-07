// services/dashboardService.ts

import api from '@/lib/axios'
import type {
  AdminDashboard,
  UserDashboard,
  PaymentsSummary,
  MyVishis,
  MyPayments,
} from '@/models/dashboard'


export const dashboardService = {
  // GET /api/dashboard/
  // M1 — backend returns AdminDashboard if is_superuser, else UserDashboard
  get: () =>
    api.get<AdminDashboard | UserDashboard>('/api/dashboard/'),

  // GET /api/payments/summary/
  // M3 — admin only: cross-vishi grouped payments overview
  getPaymentsSummary: () =>
    api.get<PaymentsSummary>('/api/payments/summary/'),

  // GET /api/profile/me/vishis/
  // M5 — user's own vishis with all slots grouped per vishi
  getMyVishis: () =>
    api.get<MyVishis>('/api/profile/me/vishis/'),

  // GET /api/profile/me/payments/
  // M6 — user's own payment history grouped by vishi
  getMyPayments: () =>
    api.get<MyPayments>('/api/profile/me/payments/'),
}
