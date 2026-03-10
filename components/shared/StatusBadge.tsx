// components/shared/StatusBadge.tsx
import { Badge }        from '@/components/ui/badge'
import { cn }           from '@/lib/utils'
import type { VishiStatus, LedgerStatus } from '@/models/vishi'

/**
 * VishiDisplayStatus extends the backend's VishiStatus with computed
 * alert states that are derived on the frontend from date comparisons.
 *
 * Priority when computing: deleted > release_pending > draw_pending > base status
 */
export type VishiDisplayStatus =
  | VishiStatus
  | 'draw_pending'
  | 'release_pending'
  | 'deleted'

const VISHI_MAP: Record<VishiDisplayStatus, { label: string; cls: string }> = {
  upcoming:        { label: '○ Upcoming',        cls: 'bg-slate-100 text-slate-600  dark:bg-slate-800    dark:text-slate-400'  },
  active:          { label: '● Active',           cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'  },
  draw_pending:    { label: '🔔 Draw Pending',    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'  },
  release_pending: { label: '💰 Release Pending', cls: 'bg-blue-100  text-blue-800  dark:bg-blue-900/30  dark:text-blue-400'   },
  completed:       { label: '✓ Completed',        cls: 'bg-teal-100  text-teal-700  dark:bg-teal-900/30  dark:text-teal-400'   },
  deleted:         { label: '🗑 Deleted',         cls: 'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400'    },
}

const LEDGER_MAP: Record<LedgerStatus, { label: string; cls: string }> = {
  paid:     { label: 'Paid',     cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  due:      { label: 'Due',      cls: 'bg-red-100   text-red-800   dark:bg-red-900/30   dark:text-red-400'   },
  overpaid: { label: 'Overpaid', cls: 'bg-blue-100  text-blue-800  dark:bg-blue-900/30  dark:text-blue-400'  },
}

/**
 * Call this in your page/card component to resolve the correct display badge.
 *
 * @example
 * const display = getVishiDisplayStatus(vishi.status, {
 *   is_deleted:      vishi.is_deleted,
 *   release_pending: today >= releaseDate && !latestDrawRecord?.is_released,
 *   draw_overdue:    today >= drawDate && !hasDrawForCurrentCycle,
 * })
 */
export function getVishiDisplayStatus(
  status:   VishiStatus,
  options?: {
    is_deleted?:      boolean
    draw_overdue?:    boolean
    release_pending?: boolean
  }
): VishiDisplayStatus {
  if (options?.is_deleted)        return 'deleted'
  if (status === 'active') {
    if (options?.release_pending) return 'release_pending'
    if (options?.draw_overdue)    return 'draw_pending'
  }
  return status
}

// ─── Badge Components ─────────────────────────────────────────────────────────

export function VishiStatusBadge({
  status, className,
}: {
  status:     VishiDisplayStatus
  className?: string
}) {
  const { label, cls } = VISHI_MAP[status]
  return (
    <Badge variant="outline" className={cn('border-0 font-medium text-xs', cls, className)}>
      {label}
    </Badge>
  )
}

export function LedgerStatusBadge({
  status, className,
}: {
  status:     LedgerStatus
  className?: string
}) {
  const { label, cls } = LEDGER_MAP[status]
  return (
    <Badge variant="outline" className={cn('border-0 font-medium text-xs', cls, className)}>
      {label}
    </Badge>
  )
}

export function ParticipantStatusBadge({
  is_drawn, is_active, was_fixed, className,
}: {
  is_drawn:   boolean
  is_active:  boolean
  was_fixed?: boolean
  className?: string
}) {
  if (!is_active) {
    return (
      <Badge variant="outline" className={cn(
        'border-0 font-medium text-xs bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        className
      )}>
        Removed
      </Badge>
    )
  }
  if (is_drawn) {
    return (
      <Badge variant="outline" className={cn(
        'border-0 font-medium text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        className
      )}>
        {was_fixed ? '🔒 Fixed' : 'Drawn'}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={cn(
      'border-0 font-medium text-xs bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
      className
    )}>
      Remaining
    </Badge>
  )
}
