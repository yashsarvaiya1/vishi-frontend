// components/admin/vishis/ManageVishisPage.tsx
'use client'

import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import { useVishis, useRestoreVishi } from '@/hooks/useVishis'
import { formatCurrency, formatDate, formatFrequency,cn } from '@/lib/utils'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton }  from '@/components/ui/skeleton'
import { Plus, Search, ChevronRight, LayoutDashboard, Trash2, RotateCcw } from 'lucide-react'
import AdminRoute    from '@/components/shared/AdminRoute'
import PageHeader    from '@/components/shared/PageHeader'
import EmptyState    from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { VishiStatusBadge, getVishiDisplayStatus } from '@/components/shared/StatusBadge'
import type { VishiAdmin } from '@/models/vishi'

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [showDeleted,  setShowDeleted]  = useState(false)

  const { data, isLoading } = useVishis({
    search:     search || undefined,
    // when showing deleted, don't filter by status — deleted can be any status
    status:     showDeleted ? undefined : (statusFilter === 'all' ? undefined : statusFilter),
    is_deleted: showDeleted ? true : false,
  })
  const vishis = (data?.results ?? []) as VishiAdmin[]

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader
          title="Manage Vishis"
          subtitle={!isLoading ? `${data?.count ?? 0} total` : undefined}
        >
          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => router.push('/admin/vishis/create')}>
            <Plus className="h-4 w-4" /> Create
          </Button>
        </PageHeader>

        {/* Deleted banner — shown when in deleted mode */}
        {showDeleted && (
          <div className="flex items-center gap-3 rounded-2xl bg-destructive/8 border border-destructive/20 px-4 py-3">
            <Trash2 className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-semibold flex-1">Showing deleted vishis</p>
            <button
              onClick={() => { setShowDeleted(false); setStatusFilter('active') }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors shrink-0"
            >
              Back to active
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={showDeleted ? 'Search deleted vishis...' : 'Search vishis...'}
            className="pl-9 rounded-xl h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter pills — hidden when showing deleted */}
        {!showDeleted && (
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Deleted toggle */}
        <button
          onClick={() => { setShowDeleted((v) => !v); setSearch('') }}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            showDeleted ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {showDeleted ? 'Hide deleted vishis' : 'Show deleted vishis'}
        </button>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : vishis.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title={
                showDeleted ? 'No deleted vishis' :
                search       ? `No results for "${search}"` :
                               'No vishis found'
              }
              description={!search && !showDeleted ? 'Create a vishi to get started.' : undefined}
            >
              {!search && !showDeleted && (
                <Button size="sm" className="rounded-xl" onClick={() => router.push('/admin/vishis/create')}>
                  <Plus className="h-4 w-4 mr-1" /> Create Vishi
                </Button>
              )}
            </EmptyState>
          ) : (
            vishis.map((vishi) => (
              <VishiCard
                key={vishi.id}
                vishi={vishi}
                isDeleted={showDeleted}
                onClick={() => !showDeleted && router.push(`/admin/vishis/${vishi.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </AdminRoute>
  )
}

function VishiCard({ vishi, isDeleted, onClick }: {
  vishi: VishiAdmin; isDeleted: boolean; onClick: () => void
}) {
  const [confirmRestore, setConfirmRestore] = useState(false)
  const restore   = useRestoreVishi(vishi.id)
  const today     = new Date()
  const drawDate  = new Date(vishi.current_draw_date)
  const latestDraw = vishi.draw_records?.[vishi.draw_records.length - 1]

  const drawOverdue = !isDeleted && vishi.status === 'active'
    && today >= drawDate
    && !vishi.draw_records?.find((r) => r.cycle_number === vishi.current_cycle + 1)

  const releasePending = !isDeleted && vishi.status === 'active'
    && !!latestDraw && !latestDraw.is_released

  const displayStatus = getVishiDisplayStatus(vishi.status, {
    is_deleted: isDeleted, draw_overdue: drawOverdue, release_pending: releasePending,
  })

  const activeCount = vishi.participants?.filter((p) => p.is_active).length ?? 0
  const progress    = vishi.total_cycles > 0 ? (vishi.current_cycle / vishi.total_cycles) * 100 : 0

  return (
    <>
      <Card
        className={cn(
          'rounded-2xl transition-all duration-150',
          isDeleted
            ? 'opacity-70 border-dashed border-destructive/30 bg-destructive/3'
            : 'cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-[0.99] group'
        )}
        onClick={onClick}
      >
        <CardContent className="px-4 pt-4 pb-3 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isDeleted && <Trash2 className="h-3.5 w-3.5 text-destructive shrink-0" />}
                <p className={cn('font-bold text-base truncate leading-tight', isDeleted && 'line-through text-muted-foreground')}>
                  {vishi.name}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(vishi.amount)} · {formatFrequency(vishi.frequency)}
                {isDeleted && vishi.deleted_at && (
                  <span className="ml-1.5 text-destructive/70">
                    · Deleted {formatDate(vishi.deleted_at)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <VishiStatusBadge status={displayStatus} />
              {!isDeleted && (
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
              {isDeleted && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1"
                  onClick={(e) => { e.stopPropagation(); setConfirmRestore(true) }}
                >
                  <RotateCcw className="h-3 w-3" /> Restore
                </Button>
              )}
            </div>
          </div>

          {/* Progress — shown for both deleted and normal */}
          {vishi.total_cycles > 0 && (
            <div>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>{activeCount} participant{activeCount !== 1 ? 's' : ''} · Cycle {vishi.current_cycle}/{vishi.total_cycles}</span>
                {!isDeleted && vishi.status !== 'completed' && (
                  <span>Draw {formatDate(vishi.current_draw_date)}</span>
                )}
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', isDeleted ? 'bg-destructive/40' : 'bg-primary')}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Alert chips */}
          {(drawOverdue || releasePending) && (
            <div className="flex gap-2 flex-wrap">
              {drawOverdue && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                  ⚡ Draw overdue
                </span>
              )}
              {releasePending && !drawOverdue && (
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded-full">
                  ↑ Release pending
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title={`Restore "${vishi.name}"?`}
        description="The vishi will be restored and visible again. Cron jobs will resume charging participants."
        confirmLabel="Restore Vishi"
        onConfirm={() => restore.mutate(undefined, { onSuccess: () => setConfirmRestore(false) })}
        loading={restore.isPending}
      />
    </>
  )
}
