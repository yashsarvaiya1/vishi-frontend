// components/admin/vishis/EditVishiPage.tsx
'use client'

import { useEffect, useState }                        from 'react'
import { useRouter }                                  from 'next/navigation'
import { useVishi, useUpdateVishi, useDeleteVishi }   from '@/hooks/useVishis'
import { Button }                                     from '@/components/ui/button'
import { Input }                                      from '@/components/ui/input'
import { Label }                                      from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle }   from '@/components/ui/card'
import { Loader2, Trash2, Lock }                      from 'lucide-react'
import AdminRoute                                     from '@/components/shared/AdminRoute'
import PageHeader                                     from '@/components/shared/PageHeader'
import LoadingSpinner                                 from '@/components/shared/LoadingSpinner'
import ConfirmDialog                                  from '@/components/shared/ConfirmDialog'
import { formatFrequency }                            from '@/lib/utils'
import type { VishiAdmin }                            from '@/models/vishi'

export default function EditVishiPage({ id }: { id: number }) {
  const router  = useRouter()
  const { data, isLoading } = useVishi(id)
  const update  = useUpdateVishi(id)
  const remove  = useDeleteVishi(id)
  const vishi   = data as VishiAdmin | undefined

  const [name,       setName]       = useState('')
  const [amount,     setAmount]     = useState('')
  const [showDelete, setShowDelete] = useState(false)

  // Upcoming-only editable fields
  const [frequency,     setFrequency]     = useState('')
  const [drawDay,       setDrawDay]       = useState('')
  const [collectionDay, setCollectionDay] = useState('')
  const [releaseDay,    setReleaseDay]    = useState('')
  const [startDate,     setStartDate]     = useState('')

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

  // Flow §4.4 — on active vishi only name is editable; amount locked too
  const isActive   = vishi?.status === 'active'
  const isUpcoming = vishi?.status === 'upcoming'

  const amountNum   = Number(amount)
  const amountValid = !isNaN(amountNum) && amountNum > 0

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!isActive && !amountValid) return

    update.mutate(
      isActive
        ? { name: name.trim() }
        : {
            name:           name.trim(),
            amount:         amount.trim(),
            frequency:      frequency as VishiAdmin['frequency'],
            draw_day:       Number(drawDay),
            collection_day: Number(collectionDay),
            release_day:    Number(releaseDay),
            start_date:     startDate,
          },
      { onSuccess: () => router.push(`/admin/vishis/${id}`) }
    )
  }

  const handleDelete = () => {
    remove.mutate(undefined, {
      onSuccess: () => router.push('/admin/vishis'),
    })
  }

  if (isLoading) {
    return (
      <AdminRoute>
        <LoadingSpinner fullPage label="Loading vishi..." />
      </AdminRoute>
    )
  }

  if (!vishi) {
    return (
      <AdminRoute>
        <p className="text-center text-muted-foreground py-12">Vishi not found.</p>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="space-y-5">
        <PageHeader back title="Edit Vishi" subtitle={vishi.name}>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </PageHeader>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Always editable */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Vishi Name</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </CardContent>
          </Card>

          {/* Amount — editable only on upcoming; locked on active per flow §4.4 */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Amount</CardTitle>
                {isActive && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Locked on active vishi
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1.5">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isActive}
                  className={isActive ? 'opacity-60' : ''}
                />
                {!isActive && amount && !amountValid && (
                  <p className="text-xs text-destructive">Amount must be greater than 0.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming-only: frequency + day settings */}
          {isUpcoming && (
            <Card className="rounded-xl">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Cycle Settings</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Draw Day</Label>
                    <Input
                      type="number" inputMode="numeric"
                      min={1} max={28}
                      value={drawDay}
                      onChange={(e) => setDrawDay(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Collect Day</Label>
                    <Input
                      type="number" inputMode="numeric"
                      min={1} max={28}
                      value={collectionDay}
                      onChange={(e) => setCollectionDay(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Release Day</Label>
                    <Input
                      type="number" inputMode="numeric"
                      min={1} max={28}
                      value={releaseDay}
                      onChange={(e) => setReleaseDay(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Draw &lt; Collection &lt; Release</p>
              </CardContent>
            </Card>
          )}

          {/* Locked fields display — active shows all as read-only */}
          {isActive && (
            <Card className="rounded-xl bg-muted/50 border-dashed">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Locked once active
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">{formatFrequency(vishi.frequency)}</span>
                  <span className="text-muted-foreground">Draw day</span>
                  <span className="font-medium">{vishi.draw_day}</span>
                  <span className="text-muted-foreground">Collection day</span>
                  <span className="font-medium">{vishi.collection_day}</span>
                  <span className="text-muted-foreground">Release day</span>
                  <span className="font-medium">{vishi.release_day}</span>
                  <span className="text-muted-foreground">Start date</span>
                  <span className="font-medium">{vishi.start_date}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={update.isPending || !name.trim() || (!isActive && !amountValid)}
          >
            {update.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : 'Save Changes'
            }
          </Button>
        </form>

        {/*
         * Flow §4.5 — type-to-confirm for all statuses.
         * Active/completed → soft delete (is_deleted = true).
         * Upcoming with zero participants → hard delete (204, no confirm needed but
         * we still ask for safety). Backend decides soft vs hard.
         */}
        <ConfirmDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          title={`Delete "${vishi.name}"?`}
          description={
            isActive
              ? `⚠️ This vishi is currently ACTIVE (Cycle ${vishi.current_cycle}/${vishi.total_cycles}).`
              : `You are about to delete this ${vishi.status} vishi.`
          }
          confirmLabel="Delete Vishi"
          variant="destructive"
          confirmText={vishi.name}
          onConfirm={handleDelete}
          loading={remove.isPending}
        >
          <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
            <li>Vishi will be marked as deleted</li>
            <li>Participants will not be charged in future cycles</li>
            <li>All payment history will be preserved</li>
            {isActive && <li>Cron jobs will skip this vishi immediately</li>}
          </ul>
        </ConfirmDialog>
      </div>
    </AdminRoute>
  )
}
