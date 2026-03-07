// components/common/my-vishis/MyVishiDetailPage.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useVishi } from '@/hooks/useVishis'
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  VishiStatusBadge,
  ParticipantStatusBadge,
} from '@/components/shared/StatusBadge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import type { VishiPublic, VishiParticipantPublic, DrawRecordPublic } from '@/models/vishi'


export default function MyVishiDetailPage({ id }: { id: number }) {
  const router = useRouter()
  const { data, isLoading } = useVishi(id)
  const vishi  = data as VishiPublic | undefined

  if (isLoading) return <LoadingSpinner fullPage label="Loading vishi..." />

  if (!vishi) return (
    <p className="text-center text-muted-foreground py-12">Vishi not found.</p>
  )

  return (
    <div className="space-y-5 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-tight truncate">{vishi.name}</h2>
          <p className="text-sm text-muted-foreground">{formatFrequency(vishi.frequency)}</p>
        </div>
      </div>

      {/* Status + amount banner */}
      <Card className="rounded-xl bg-primary/5 border-primary/10">
        <CardContent className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Amount per cycle</p>
              <p className="text-2xl font-bold">{formatCurrency(vishi.amount)}</p>
            </div>
            <VishiStatusBadge status={vishi.status} />
          </div>
          <Separator className="my-3" />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold">{vishi.current_cycle}</p>
              <p className="text-xs text-muted-foreground">Current cycle</p>
            </div>
            <div>
              <p className="text-lg font-bold">{vishi.total_cycles}</p>
              <p className="text-xs text-muted-foreground">Total cycles</p>
            </div>
            <div>
              <p className="text-lg font-bold">{vishi.participants.filter((p) => p.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming dates */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Upcoming Dates</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-muted-foreground">Draw</span>
            <span className="font-medium">{formatDate(vishi.current_draw_date)}</span>
            <span className="text-muted-foreground">Collection</span>
            <span className="font-medium">{formatDate(vishi.current_collection_date)}</span>
            <span className="text-muted-foreground">Release</span>
            <span className="font-medium">{formatDate(vishi.current_release_date)}</span>
            <span className="text-muted-foreground">Start</span>
            <span>{formatDate(vishi.start_date)}</span>
            <span className="text-muted-foreground">Finish</span>
            <span>{formatDate(vishi.finish_date)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">
            Participants ({vishi.participants.filter((p) => p.is_active).length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 divide-y">
          {vishi.participants.map((p) => (
            <ParticipantRow key={p.id} participant={p} />
          ))}
        </CardContent>
      </Card>

      {/* Draw history */}
      {vishi.draw_records.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">
              Draw History ({vishi.draw_records.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 divide-y">
            {vishi.draw_records.map((r, i) => (
              <DrawRow key={i} record={r} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


function ParticipantRow({ participant }: { participant: VishiParticipantPublic }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">
          {participant.vishi_name || participant.username}
        </p>
        {participant.vishi_name && (
          <p className="text-xs text-muted-foreground">{participant.username}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <ParticipantStatusBadge
          is_drawn={participant.is_drawn}
          is_active={participant.is_active}
        />
        {participant.is_drawn && participant.drawn_at && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(participant.drawn_at)}
          </p>
        )}
      </div>
    </div>
  )
}


function DrawRow({ record }: { record: DrawRecordPublic }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold">Cycle {record.cycle_number}</span>
          {record.was_fixed && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
              <Lock className="h-2.5 w-2.5 mr-1" />Fixed
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {record.vishi_name} · {formatDate(record.drawn_at)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <Badge
          variant="outline"
          className={
            record.is_released
              ? 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 text-xs'
              : 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 text-xs'
          }
        >
          {record.is_released ? 'Released' : 'Pending'}
        </Badge>
        {record.is_released && record.released_at && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(record.released_at)}
          </p>
        )}
      </div>
    </div>
  )
}
