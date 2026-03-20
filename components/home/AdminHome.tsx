// components/home/AdminHome.tsx
'use client'

import { useRouter }   from 'next/navigation'
import {
  AlertTriangle, Clock, CreditCard,
  Users, TrendingUp, Wallet, ChevronRight,
  Zap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button }            from '@/components/ui/button'
import { Badge }             from '@/components/ui/badge'
import { cn }                from '@/lib/utils'
import useAuthStore          from '@/stores/authStore'
import type { AdminDashboard, AlertType, ActionAlert, UpcomingEvent } from '@/models/dashboard'

interface Props { data: AdminDashboard }

type AlertCfg = {
  icon:     React.ElementType
  color:    string
  bg:       string
  border:   string
  btnLabel: string
  href:     (vishiId: number) => string
}

const ALERT_CFG: Record<AlertType, AlertCfg> = {
  draw_overdue: {
    icon:     AlertTriangle,
    color:    'text-amber-600 dark:text-amber-400',
    bg:       'bg-amber-50 dark:bg-amber-900/20',
    border:   'border-amber-200 dark:border-amber-800',
    btnLabel: 'Draw Now',
    href:     (id) => `/admin/vishis/${id}`,
  },
  release_pending: {
    icon:     Clock,
    color:    'text-sky-600 dark:text-sky-400',
    bg:       'bg-sky-50 dark:bg-sky-900/20',
    border:   'border-sky-200 dark:border-sky-800',
    btnLabel: 'Release',
    href:     (id) => `/admin/vishis/${id}`,
  },
  payments_pending: {
    icon:     CreditCard,
    color:    'text-rose-600 dark:text-rose-400',
    bg:       'bg-rose-50 dark:bg-rose-900/20',
    border:   'border-rose-200 dark:border-rose-800',
    btnLabel: 'Collect',
    href:     (id) => `/admin/vishis/${id}`,
  },
}

const EVENT_CFG: Record<UpcomingEvent['event_type'], { emoji: string; label: string; cls: string }> = {
  draw:       { emoji: '🎰', label: 'Draw Day',       cls: 'text-amber-600 dark:text-amber-400'   },
  collection: { emoji: '💰', label: 'Collection Day', cls: 'text-emerald-600 dark:text-emerald-400' },
  release:    { emoji: '📤', label: 'Release Day',    cls: 'text-sky-600 dark:text-sky-400'        },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function AdminHome({ data }: Props) {
  const router   = useRouter()
  const username = useAuthStore((s) => s.username)
  const mobile   = useAuthStore((s) => s.mobile_number)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  const STAT_CARDS = [
    { label: 'Active',    value: data.active_vishis_count,   icon: TrendingUp, iconCls: 'text-emerald-600', bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' },
    { label: 'Upcoming',  value: data.upcoming_vishis_count, icon: Clock,      iconCls: 'text-amber-500',   bg: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
    { label: 'Members',   value: data.total_members,         icon: Users,      iconCls: 'text-sky-500',     bg: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20'         },
    { label: 'Users',     value: data.total_users,           icon: Wallet,     iconCls: 'text-primary',     bg: 'from-primary/5 to-violet-50 dark:from-primary/10 dark:to-violet-900/20'  },
  ]

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <p className="text-xs text-muted-foreground font-medium">{today}</p>
        <h2 className="text-2xl font-black tracking-tight mt-0.5">
          {getGreeting()}, {username || mobile} 👋
        </h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, iconCls, bg }) => (
          <div
            key={label}
            className={cn(
              'rounded-2xl px-4 py-4 space-y-3 bg-gradient-to-br border border-transparent',
              bg
            )}
          >
            <div className={cn('h-8 w-8 rounded-xl bg-background/60 flex items-center justify-center', iconCls)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-3xl font-black leading-none">{value}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Required */}
      {data.action_required.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Action Required
            </h3>
            <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {data.action_required.length}
            </span>
          </div>
          <div className="space-y-2">
            {data.action_required.map((alert, i) => (
              <AlertRow
                key={i}
                alert={alert}
                onAction={() => router.push(ALERT_CFG[alert.action].href(alert.vishi_id))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming This Week */}
      {data.upcoming_this_week.length > 0 && (
        <section className="space-y-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span>📅</span> Upcoming This Week
          </h3>
          <Card className="rounded-2xl overflow-hidden divide-y">
            {data.upcoming_this_week.map((ev, i) => (
              <EventRow
                key={i}
                event={ev}
                onClick={() => router.push(`/admin/vishis/${ev.vishi_id}`)}
              />
            ))}
          </Card>
        </section>
      )}

    </div>
  )
}

function AlertRow({ alert, onAction }: { alert: ActionAlert; onAction: () => void }) {
  const cfg  = ALERT_CFG[alert.action]
  const Icon = cfg.icon
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-2xl px-4 py-3 border',
      cfg.bg, cfg.border
    )}>
      <div className={cn('h-8 w-8 rounded-xl bg-background/60 flex items-center justify-center shrink-0', cfg.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{alert.vishi_name}</p>
        <p className="text-xs text-muted-foreground">{alert.detail}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs shrink-0 px-3 rounded-xl bg-background/80"
        onClick={onAction}
      >
        {cfg.btnLabel}
      </Button>
    </div>
  )
}

function EventRow({ event, onClick }: { event: UpcomingEvent; onClick: () => void }) {
  const cfg     = EVENT_CFG[event.event_type]
  const dateStr = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 active:bg-muted/60 transition-colors"
      onClick={onClick}
    >
      <span className="text-base shrink-0">{cfg.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{event.vishi_name}</p>
        <p className={cn('text-xs font-medium', cfg.cls)}>{cfg.label}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge variant="outline" className="text-xs font-semibold rounded-full">{dateStr}</Badge>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  )
}
