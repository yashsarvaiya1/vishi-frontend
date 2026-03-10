// components/admin/vishis/ManageVishisPage.tsx
'use client'

import { useState }  from 'react'
import { useRouter } from 'next/navigation'
import { useVishis } from '@/hooks/useVishis'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton }  from '@/components/ui/skeleton'
import { Badge }     from '@/components/ui/badge'
import { Plus, Search, ChevronRight, LayoutDashboard, Trash2 } from 'lucide-react'
import AdminRoute    from '@/components/shared/AdminRoute'
import PageHeader    from '@/components/shared/PageHeader'
import EmptyState    from '@/components/shared/EmptyState'
import {
  VishiStatusBadge,
  getVishiDisplayStatus,
} from '@/components/shared/StatusBadge'
import type { VishiAdmin } from '@/models/vishi'

// Flow §4.1 — status filter tabs (excludes draw_pending / release_pending —
// those are computed display states not raw API statuses)
type StatusFilter = 'all' | 'active' | 'upcoming' | 'completed'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Active',    value: 'active'    },
  { label: 'Upcoming',  value: 'upcoming'  },
  { label: 'Completed', value: 'completed' },
]

export default function ManageVishisPage() {
  const router = useRouter()

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  // Flow §4.1 — deleted toggle: show soft-deleted vishis
  const [showDeleted,  setShowDeleted]  = useState(false)

  const { data, isLoading } = useVishis({
    search,
    status: statusFilter === 'all' ? undefined : statusFilter,
    ...(showDeleted ? { is_deleted: true } : {}),
  })
  const vishis = (data?.results ?? []) as VishiAdmin[]

  const filtered = statusFilter === 'all'
    ? vishis
    : vishis.filter((v) => v.status === statusFilter)

  const deletedCount = showDeleted ? vishis.length : undefined

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader
          title="Manage Vishis"
          subtitle={!isLoading ? `${data?.count ?? 0} total` : undefined}
        >
          <Button size="sm" onClick={() => router.push('/admin/vishis/create')}>
            <Plus className="h-4 w-4 mr-1" /> Create
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

        {/* Flow §4.1 — deleted toggle */}
        <button
          onClick={() => { setShowDeleted((v) => !v); setStatusFilter('all') }}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            showDeleted
              ? 'text-destructive'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {showDeleted ? 'Hide deleted' : 'Show deleted vishis'}
        </button>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title={
                showDeleted
                  ? 'No deleted vishis'
                  : search
                  ? `No results for "${search}"`
                  : 'No vishis found'
              }
              description={!search && !showDeleted ? 'Create a vishi to get started.' : undefined}
            >
              {!search && !showDeleted && (
                <Button size="sm" onClick={() => router.push('/admin/vishis/create')}>
                  <Plus className="h-4 w-4 mr-1" /> Create Vishi
                </Button>
              )}
            </EmptyState>
          ) : (
            filtered.map((vishi) => (
              <VishiCard
                key={vishi.id}
                vishi={vishi}
                isDeleted={showDeleted}
                onClick={() => router.push(`/admin/vishis/${vishi.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </AdminRoute>
  )
}

// ─── Vishi card ───────────────────────────────────────────────────────────────

function VishiCard({
  vishi, isDeleted, onClick,
}: {
  vishi:     VishiAdmin
  isDeleted: boolean
  onClick:   () => void
}) {
  /*
   * Flow §4.1 — computed display status:
   * draw_pending  = active + today >= current_draw_date + no draw record for current_cycle+1
   * release_pending = active + today >= current_release_date + is_released=false on latest draw
   * getVishiDisplayStatus handles this logic via passed flags from VishiAdmin fields.
   */
  const today         = new Date()
  const drawDate      = new Date(vishi.current_draw_date)
  const releaseDate   = new Date(vishi.current_release_date)
  const latestDraw    = vishi.draw_records?.[vishi.draw_records.length - 1]

  const drawOverdue = vishi.status === 'active'
    && today >= drawDate
    && !vishi.draw_records.find((r) => r.cycle_number === vishi.current_cycle)
  const releasePending  = vishi.status === 'active'
    && today >= releaseDate
    && !!latestDraw
    && !latestDraw.is_released

  const displayStatus = getVishiDisplayStatus(vishi.status, {
    is_deleted:      isDeleted,
    draw_overdue:    drawOverdue,
    release_pending: releasePending,
  })

  const activeCount = vishi.participants?.filter((p) => p.is_active).length ?? 0

  return (
    <Card
      className={`rounded-xl cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group ${
        isDeleted ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base truncate">{vishi.name}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <VishiStatusBadge status={displayStatus} />
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-1">
        <p className="text-sm text-muted-foreground">
          {formatCurrency(vishi.amount)} · {formatFrequency(vishi.frequency)}
        </p>
        <p className="text-sm text-muted-foreground">
          {activeCount} participant{activeCount !== 1 ? 's' : ''}
          {' · '}Cycle {vishi.current_cycle}/{vishi.total_cycles}
        </p>
        {!isDeleted && vishi.status !== 'completed' && (
          <p className="text-xs text-muted-foreground">
            Next draw: <span className="font-medium">{formatDate(vishi.current_draw_date)}</span>
          </p>
        )}
        {/* Draw overdue / release pending inline cues */}
        {drawOverdue && (
          <p className="text-xs font-semibold text-amber-600">⚠ Draw overdue</p>
        )}
        {releasePending && !drawOverdue && (
          <p className="text-xs font-semibold text-blue-600">• Release pending</p>
        )}
      </CardContent>
    </Card>
  )
}
