// components/common/my-vishis/MyVishisPage.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useVishis } from '@/hooks/useVishis'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight, Wallet } from 'lucide-react'
import { VishiStatusBadge } from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/shared/PageHeader'
import type { VishiPublic } from '@/models/vishi'


export default function MyVishisPage() {
  const router = useRouter()
  const { data, isLoading } = useVishis()
  const vishis = (data?.results ?? []) as VishiPublic[]

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Vishis"
        subtitle={!isLoading ? `${vishis.length} total` : undefined}
      />

      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
        ) : vishis.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No vishis yet"
            description="You are not part of any vishi yet. Contact your admin to be added."
          />
        ) : (
          vishis.map((vishi) => (
            <Card
              key={vishi.id}
              className="rounded-xl cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
              onClick={() => router.push(`/common/my-vishis/${vishi.id}`)}
            >
              <CardHeader className="pb-1 pt-4 px-4">
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
                  {vishi.participants.length} participants · Cycle {vishi.current_cycle}/{vishi.total_cycles}
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground pt-0.5 flex-wrap">
                  <span>Draw: <span className="font-medium">{formatDate(vishi.current_draw_date)}</span></span>
                  <span>Collect: <span className="font-medium">{formatDate(vishi.current_collection_date)}</span></span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
