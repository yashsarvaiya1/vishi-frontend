// components/admin/vishis/EditVishiPage.tsx
'use client'

import { useEffect, useState }                                from 'react'
import { useRouter }                                          from 'next/navigation'
import { useVishi, useUpdateVishi, useDeleteVishi, useRestoreVishi } from '@/hooks/useVishis'
import { Button }                                             from '@/components/ui/button'
import { Input }                                             from '@/components/ui/input'
import { Label }                                             from '@/components/ui/label'
import { Card, CardContent }                                  from '@/components/ui/card'
import { Loader2, Trash2, Lock, RotateCcw }                  from 'lucide-react'
import AdminRoute     from '@/components/shared/AdminRoute'
import PageHeader     from '@/components/shared/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ConfirmDialog  from '@/components/shared/ConfirmDialog'
import { formatFrequency } from '@/lib/utils'
import type { VishiAdmin } from '@/models/vishi'
import React from 'react'

export default function EditVishiPage({ id }: { id: number }) {
  const router = useRouter()
  const { data, isLoading } = useVishi(id)
  const update  = useUpdateVishi(id)
  const remove  = useDeleteVishi(id)
  const restore = useRestoreVishi(id)
  const vishi   = data as VishiAdmin | undefined

  const [name,          setName]          = useState('')
  const [amount,        setAmount]        = useState('')
  const [frequency,     setFrequency]     = useState('')
  const [drawDay,       setDrawDay]       = useState('')
  const [collectionDay, setCollectionDay] = useState('')
  const [releaseDay,    setReleaseDay]    = useState('')
  const [startDate,     setStartDate]     = useState('')
  const [showDelete,    setShowDelete]    = useState(false)
  const [showRestore,   setShowRestore]   = useState(false)

  useEffect(() => {
    if (!vishi) return
    setName(vishi.name)
    setAmount(vishi.amount)
    setFrequency(vishi.frequency)
    setDrawDay(String(vishi.draw_day))
    setCollectionDay(String(vishi.collection_day))
    setReleaseDay(String(vishi.release_day))
    setStartDate(vishi.start_date)
  }, [vishi])

  const isActive   = vishi?.status === 'active'
  const isUpcoming = vishi?.status === 'upcoming'
  const isDeleted  = vishi?.is_deleted ?? false
  const amountValid = !isNaN(Number(amount)) && Number(amount) > 0

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || (!isActive && !amountValid)) return
    update.mutate(
      isActive
        ? { name: name.trim() }
        : {
            name: name.trim(), amount: amount.trim(),
            frequency: frequency as VishiAdmin['frequency'],
            draw_day: Number(drawDay), collection_day: Number(collectionDay),
            release_day: Number(releaseDay), start_date: startDate,
          },
      { onSuccess: () => router.push(`/admin/vishis/${id}`) }
    )
  }

  if (isLoading) return <AdminRoute><LoadingSpinner fullPage label="Loading vishi..." /></AdminRoute>
  if (!vishi)    return <AdminRoute><p className="text-center text-muted-foreground py-12">Vishi not found.</p></AdminRoute>

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader back title="Edit Vishi" subtitle={vishi.name}>
          {isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setShowRestore(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restore
            </Button>
          ) : (
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </PageHeader>

        {/* Deleted warning banner */}
        {isDeleted && (
          <div className="flex items-center gap-3 rounded-2xl bg-destructive/8 border border-destructive/20 px-4 py-3.5">
            <Trash2 className="h-4 w-4 text-destructive shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-destructive">This vishi is deleted</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Participants are not being charged. Restore to resume normal operation.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">

          {/* Name */}
          <Card className="rounded-2xl">
            <CardContent className="px-5 py-5 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Vishi Name</p>
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  value={name} onChange={(e) => setName(e.target.value)}
                  autoFocus className="rounded-xl h-10"
                  disabled={isDeleted}
                />
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card className="rounded-2xl">
            <CardContent className="px-5 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Amount</p>
                {isActive && !isDeleted && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    <Lock className="h-3 w-3" /> Locked on active vishi
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Amount (₹)</Label>
                <Input
                  type="number" inputMode="numeric" min="1"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  disabled={isActive || isDeleted}
                  className={`rounded-xl h-10 ${(isActive || isDeleted) ? 'opacity-60' : ''}`}
                />
                {!isActive && !isDeleted && amount && !amountValid && (
                  <p className="text-xs text-destructive">Amount must be greater than 0.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming-only cycle settings */}
          {isUpcoming && !isDeleted && (
            <Card className="rounded-2xl">
              <CardContent className="px-5 py-5 space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Cycle Settings</p>
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl h-10" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Draw Day',       value: drawDay,       set: setDrawDay       },
                    { label: 'Collection Day', value: collectionDay, set: setCollectionDay },
                    { label: 'Release Day',    value: releaseDay,    set: setReleaseDay    },
                  ].map(({ label, value, set }) => (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-xs">{label}</Label>
                      <Input type="number" inputMode="numeric" min={1} max={28}
                        value={value} onChange={(e) => set(e.target.value)} className="rounded-xl h-10" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Draw &lt; Collection &lt; Release</p>
              </CardContent>
            </Card>
          )}

          {/* Locked fields for active */}
          {isActive && (
            <Card className="rounded-2xl bg-muted/30 border-dashed">
              <CardContent className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-semibold">Locked once active</p>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  {[
                    ['Frequency',       formatFrequency(vishi.frequency)],
                    ['Draw day',        String(vishi.draw_day)],
                    ['Collection day',  String(vishi.collection_day)],
                    ['Release day',     String(vishi.release_day)],
                    ['Start date',      vishi.start_date],
                  ].map(([label, value]) => (
                    <React.Fragment key={label}>
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!isDeleted && (
            <Button type="submit" className="w-full h-12 rounded-2xl font-bold text-base"
              disabled={update.isPending || !name.trim() || (!isActive && !amountValid)}>
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          )}
        </form>

        {/* Delete confirm */}
        <ConfirmDialog
          open={showDelete} onOpenChange={setShowDelete}
          title={`Delete "${vishi.name}"?`}
          description={
            isActive
              ? `⚠️ This vishi is currently ACTIVE (Cycle ${vishi.current_cycle}/${vishi.total_cycles}).`
              : `You are about to delete this ${vishi.status} vishi.`
          }
          confirmLabel="Delete Vishi" variant="destructive"
          confirmText={vishi.name}
          onConfirm={() => remove.mutate(undefined, { onSuccess: () => router.push('/admin/vishis') })}
          loading={remove.isPending}
        >
          <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
            <li>Vishi will be marked as deleted</li>
            <li>Participants will not be charged in future cycles</li>
            <li>All payment history will be preserved</li>
            {isActive && <li>Cron jobs will skip this vishi immediately</li>}
          </ul>
        </ConfirmDialog>

        {/* Restore confirm */}
        <ConfirmDialog
          open={showRestore} onOpenChange={setShowRestore}
          title={`Restore "${vishi.name}"?`}
          description="The vishi will be restored and visible again."
          confirmLabel="Restore Vishi"
          onConfirm={() => restore.mutate(undefined, { onSuccess: () => { setShowRestore(false); router.push(`/admin/vishis/${id}`) } })}
          loading={restore.isPending}
        >
          <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
            <li>Vishi becomes active again in the list</li>
            <li>Cron jobs will resume charging participants</li>
            <li>All history and ledgers are preserved</li>
          </ul>
        </ConfirmDialog>
      </div>
    </AdminRoute>
  )
}
