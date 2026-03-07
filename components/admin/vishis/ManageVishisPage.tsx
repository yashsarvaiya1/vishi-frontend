// components/admin/vishis/ManageVishisPage.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useVishis } from '@/hooks/useVishis'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, ChevronRight, LayoutDashboard } from 'lucide-react'
import AdminRoute from '@/components/shared/AdminRoute'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import { VishiStatusBadge } from '@/components/shared/StatusBadge'
import type { VishiAdmin } from '@/models/vishi'
import type { VishiStatus } from '@/models/vishi'

const STATUS_TABS: { label: string; value: VishiStatus | 'all' }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Active',    value: 'active'    },
  { label: 'Upcoming',  value: 'upcoming'  },
  { label: 'Completed', value: 'completed' },
]

export default function ManageVishisPage() {
  const router = useRouter()
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<VishiStatus | 'all'>('all')

  const { data, isLoading } = useVishis({ search })
  const vishis = (data?.results ?? []) as VishiAdmin[]

  const filtered = statusFilter === 'all'
    ? vishis
    : vishis.filter((v) => v.status === statusFilter)

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader
          title="Manage Vishis"
          subtitle={!isLoading ? `${vishis.length} total` : undefined}
        >
          <Button size="sm" onClick={() => router.push('/admin/vishis/create')}>
            <Plus className="h-4 w-4 mr-1" /> Create Vishi
          </Button>
        </PageHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vishis..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === 'all'
              ? vishis.length
              : vishis.filter((v) => v.status === tab.value).length
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-70">{count}</span>
              </button>
            )
          })}
        </div>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title={search ? `No results for "${search}"` : 'No vishis found'}
              description={!search ? 'Create a vishi to get started.' : undefined}
            >
              {!search && (
                <Button size="sm" onClick={() => router.push('/admin/vishis/create')}>
                  <Plus className="h-4 w-4 mr-1" /> Create Vishi
                </Button>
              )}
            </EmptyState>
          ) : (
            filtered.map((vishi) => (
              <Card
                key={vishi.id}
                className="rounded-xl cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
                onClick={() => router.push(`/admin/vishis/${vishi.id}`)}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base truncate">{vishi.name}</CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                      <VishiStatusBadge status={vishi.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(vishi.amount)} · {formatFrequency(vishi.frequency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vishi.participants?.filter((p) => p.is_active).length ?? 0} participants
                    {' · '}Cycle {vishi.current_cycle}/{vishi.total_cycles}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Next draw: <span className="font-medium">{formatDate(vishi.current_draw_date)}</span>
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminRoute>
  )
}
