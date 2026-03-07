// components/home/HomePage.tsx
'use client'

import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/authStore'
import { useVishis } from '@/hooks/useVishis'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, TrendingUp, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import { VishiStatusBadge } from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import type { VishiAdmin, VishiPublic } from '@/models/vishi'


export default function HomePage() {
  const router       = useRouter()
  const username     = useAuthStore((s) => s.username)
  const mobile       = useAuthStore((s) => s.mobile_number)
  const is_superuser = useAuthStore((s) => s.is_superuser)

  const { data, isLoading } = useVishis()
  const vishis = (data?.results ?? []) as (VishiAdmin | VishiPublic)[]

  const active    = vishis.filter((v) => v.status === 'active').length
  const upcoming  = vishis.filter((v) => v.status === 'upcoming').length
  const completed = vishis.filter((v) => v.status === 'completed').length

  const goToDetail = (id: number) =>
    router.push(is_superuser ? `/admin/vishis/${id}` : `/common/my-vishis/${id}`)

  // Show active first, then upcoming
  const highlightedVishis = [
    ...vishis.filter((v) => v.status === 'active'),
    ...vishis.filter((v) => v.status === 'upcoming'),
  ]

  return (
    <div className="space-y-7">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Hello, {username || mobile} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          {is_superuser ? 'Admin Dashboard' : 'Your Vishi Overview'}
        </p>
      </div>

      {/* Summary stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Wallet className="h-5 w-5 text-primary" />}
            label="Total"
            value={vishis.length}
            bg="bg-primary/5"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            label="Active"
            value={active}
            bg="bg-green-500/5"
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            label="Upcoming"
            value={upcoming}
            bg="bg-amber-500/5"
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-slate-400" />}
            label="Completed"
            value={completed}
            bg="bg-muted"
          />
        </div>
      )}

      {/* Vishi list — active + upcoming */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          {is_superuser ? 'All Vishis' : 'Your Vishis'}
        </h3>

        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : highlightedVishis.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No active vishis"
            description={
              is_superuser
                ? 'Create a vishi and add participants to get started.'
                : 'You are not part of any active vishi yet. Contact admin.'
            }
          />
        ) : (
          highlightedVishis.map((vishi) => (
            <VishiCard key={vishi.id} vishi={vishi} onClick={() => goToDetail(vishi.id)} />
          ))
        )}
      </div>
    </div>
  )
}


function StatCard({
  icon, label, value, bg,
}: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <Card className={`rounded-xl border-0 shadow-none ${bg}`}>
      <CardContent className="pt-4 pb-4 px-4 flex flex-col gap-2">
        {icon}
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </CardContent>
    </Card>
  )
}


function VishiCard({
  vishi, onClick,
}: { vishi: VishiAdmin | VishiPublic; onClick: () => void }) {
  return (
    <Card
      className="rounded-xl cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
      onClick={onClick}
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
          Cycle {vishi.current_cycle} of {vishi.total_cycles}
        </p>
        <p className="text-xs text-muted-foreground pt-0.5">
          Next draw: <span className="font-medium">{formatDate(vishi.current_draw_date)}</span>
        </p>
      </CardContent>
    </Card>
  )
}
