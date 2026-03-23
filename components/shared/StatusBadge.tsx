// components/shared/StatusBadge.tsx
import { Badge }        from '@/components/ui/badge'
import { cn }           from '@/lib/utils'
import type { VishiStatus, LedgerStatus } from '@/models/vishi'

export type VishiDisplayStatus =
  | VishiStatus
  | 'draw_pending'
  | 'release_pending'
  | 'deleted'

const VISHI_MAP: Record<VishiDisplayStatus, { label: string; cls: string }> = {
  upcoming:        { label: 'Upcoming',         cls: 'bg-slate-100  text-slate-600  dark:bg-slate-800/60  dark:text-slate-300'  },
  active:          { label: '● Active',          cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  draw_pending:    { label: '⚡ Draw Due',        cls: 'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400'  },
  release_pending: { label: '↑ Release',         cls: 'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-400'    },
  completed:       { label: '✓ Completed',       cls: 'bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-400'   },
  deleted:         { label: 'Deleted',           cls: 'bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-400'   },
}

const LEDGER_MAP: Record<LedgerStatus, { label: string; cls: string }> = {
  paid:     { label: 'Paid',     cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  due:      { label: 'Due',      cls: 'bg-rose-100    text-rose-800   dark:bg-rose-900/30    dark:text-rose-400'    },
  overpaid: { label: 'Overpaid', cls: 'bg-sky-100     text-sky-800    dark:bg-sky-900/30     dark:text-sky-400'     },
}

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

export function VishiStatusBadge({
  status, className,
}: {
  status:     VishiDisplayStatus
  className?: string
}) {
  const { label, cls } = VISHI_MAP[status]
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-semibold text-[11px] px-2 py-0.5 rounded-full tracking-wide',
        cls, className
      )}
    >
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
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-semibold text-[11px] px-2 py-0.5 rounded-full',
        cls, className
      )}
    >
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
      <Badge
        variant="outline"
        className={cn(
          'border-0 font-semibold text-[11px] px-2 py-0.5 rounded-full',
          'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400',
          className
        )}
      >
        Removed
      </Badge>
    )
  }
  if (is_drawn) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-0 font-semibold text-[11px] px-2 py-0.5 rounded-full',
          'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
          className
        )}
      >
        {was_fixed ? '🔒 Fixed' : '★ Won'}
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-semibold text-[11px] px-2 py-0.5 rounded-full',
        'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
        className
      )}
    >
      In Pool
    </Badge>
  )
}
