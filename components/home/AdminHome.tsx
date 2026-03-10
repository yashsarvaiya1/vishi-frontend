// components/home/AdminHome.tsx
'use client'

import { useRouter }   from 'next/navigation'
import {
  AlertTriangle, Clock, CreditCard,
  Users, TrendingUp, Wallet, ChevronRight,
} from 'lucide-react'
import { Card }     from '@/components/ui/card'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { cn }       from '@/lib/utils'
import useAuthStore from '@/stores/authStore'
// FIXED: correct field names from AdminDashboard model
import type { AdminDashboard, AlertType, ActionAlert, UpcomingEvent } from '@/models/dashboard'


interface Props { data: AdminDashboard }


type AlertCfg = {
  icon:     React.ElementType
  color:    string
  bg:       string
  btnLabel: string
  href:     (vishiId: number) => string
}

const ALERT_CFG: Record<AlertType, AlertCfg> = {
  draw_overdue: {
    icon:     AlertTriangle,
    color:    'text-amber-600 dark:text-amber-400',
    bg:       'bg-amber-50 dark:bg-amber-900/20',
    btnLabel: 'Draw Now',
    href:     (id) => `/admin/vishis/${id}`,
  },
  release_pending: {
    icon:     Clock,
    color:    'text-blue-600 dark:text-blue-400',
    bg:       'bg-blue-50 dark:bg-blue-900/20',
    btnLabel: 'Release',
    href:     (id) => `/admin/vishis/${id}`,
  },
  payments_pending: {
    icon:     CreditCard,
    color:    'text-red-600 dark:text-red-400',
    bg:       'bg-red-50 dark:bg-red-900/20',
    btnLabel: 'Collect',
    href:     (id) => `/admin/vishis/${id}`,
  },
}

const EVENT_LABEL: Record<UpcomingEvent['event_type'], string> = {
  draw:       '🎰 Draw Day',
  collection: '💰 Collection Day',
  release:    '📤 Release Day',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}


// ─── Main ─────────────────────────────────────────────────────────────────────


export default function AdminHome({ data }: Props) {
  const router   = useRouter()
  const username = useAuthStore((s) => s.username)
  const mobile   = useAuthStore((s) => s.mobile_number)

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {getGreeting()}, {username || mobile} 👋
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
        </div>
      </div>

      {/* 4 Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* FIXED: active_vishis_count (not active_vishis) */}
        <StatCard
          label="Active Vishis"  value={data.active_vishis_count}
          icon={TrendingUp}      iconCls="text-green-600" bg="bg-green-500/5"
        />
        {/* FIXED: upcoming_vishis_count (not upcoming_vishis) */}
        <StatCard
          label="Upcoming"       value={data.upcoming_vishis_count}
          icon={Clock}           iconCls="text-amber-500" bg="bg-amber-500/5"
        />
        <StatCard
          label="Total Members"  value={data.total_members}
          icon={Users}           iconCls="text-blue-500"  bg="bg-blue-500/5"
        />
        <StatCard
          label="Total Users"    value={data.total_users}
          icon={Wallet}          iconCls="text-primary"   bg="bg-primary/5"
        />
      </div>

      {/* Action Required */}
      {/* FIXED: action_required (not action_alerts) */}
      {data.action_required.length > 0 && (
        <section className="space-y-2">
          <SectionLabel>🔔 Action Required</SectionLabel>
          <div className="space-y-2">
            {data.action_required.map((alert, i) => (
              <AlertRow
                key={i}
                alert={alert}
                // FIXED: alert.action (not alert.type)
                onAction={() => router.push(ALERT_CFG[alert.action].href(alert.vishi_id))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming This Week */}
      {/* FIXED: upcoming_this_week (not upcoming_events) */}
      {data.upcoming_this_week.length > 0 && (
        <section className="space-y-2">
          <SectionLabel>📅 Upcoming This Week</SectionLabel>
          <Card className="rounded-xl overflow-hidden divide-y">
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


// ─── Sub-components ───────────────────────────────────────────────────────────


function StatCard({
  label, value, icon: Icon, iconCls, bg,
}: {
  label: string; value: number
  icon: React.ElementType; iconCls: string; bg: string
}) {
  return (
    <div className={cn('rounded-xl px-4 py-4 space-y-2', bg)}>
      <Icon className={cn('h-4 w-4', iconCls)} />
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </div>
  )
}


function AlertRow({
  alert, onAction,
}: {
  alert:    ActionAlert
  onAction: () => void
}) {
  // FIXED: alert.action (not alert.type)
  const cfg  = ALERT_CFG[alert.action]
  const Icon = cfg.icon

  return (
    <div className={cn('flex items-center gap-3 rounded-xl px-4 py-3', cfg.bg)}>
      <Icon className={cn('h-4 w-4 shrink-0', cfg.color)} />
      <p className="text-sm flex-1 min-w-0 leading-snug">
        <span className="font-semibold">{alert.vishi_name}</span>
        {' — '}
        <span className="text-muted-foreground text-xs">{alert.detail}</span>
      </p>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs shrink-0 px-2.5"
        onClick={onAction}
      >
        {cfg.btnLabel}
      </Button>
    </div>
  )
}


function EventRow({
  event, onClick,
}: {
  event:   UpcomingEvent
  onClick: () => void
}) {
  const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  })

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
      onClick={onClick}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{event.vishi_name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {EVENT_LABEL[event.event_type]}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge variant="outline" className="text-xs font-medium">{dateStr}</Badge>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  )
}


function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
      {children}
    </h3>
  )
}
