// components/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VishiStatus, LedgerStatus } from '@/models/vishi'

const VISHI_MAP: Record<VishiStatus, { label: string; cls: string }> = {
  upcoming:  { label: 'Upcoming',  cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'  },
  active:    { label: 'Active',    cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'  },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800    dark:text-slate-400'  },
}

const LEDGER_MAP: Record<LedgerStatus, { label: string; cls: string }> = {
  paid:     { label: 'Paid',     cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  due:      { label: 'Due',      cls: 'bg-red-100   text-red-800   dark:bg-red-900/30   dark:text-red-400'   },
  overpaid: { label: 'Overpaid', cls: 'bg-blue-100  text-blue-800  dark:bg-blue-900/30  dark:text-blue-400'  },
}

export function VishiStatusBadge({
  status, className,
}: { status: VishiStatus; className?: string }) {
  const { label, cls } = VISHI_MAP[status]
  return (
    <Badge variant="outline" className={cn('border-0 font-medium text-xs', cls, className)}>
      {label}
    </Badge>
  )
}

export function LedgerStatusBadge({
  status, className,
}: { status: LedgerStatus; className?: string }) {
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
  is_drawn: boolean; is_active: boolean
  was_fixed?: boolean; className?: string
}) {
  if (!is_active) {
    return (
      <Badge variant="outline" className={cn('border-0 font-medium text-xs bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', className)}>
        Removed
      </Badge>
    )
  }
  if (is_drawn) {
    return (
      <Badge variant="outline" className={cn('border-0 font-medium text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', className)}>
        {was_fixed ? '🔒 Fixed' : 'Drawn'}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={cn('border-0 font-medium text-xs bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400', className)}>
      Remaining
    </Badge>
  )
}
