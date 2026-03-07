'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useVishi, useUpdateVishi, useDeleteVishi } from '@/hooks/useVishis'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import AdminRoute from '@/components/shared/AdminRoute'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { formatFrequency } from '@/lib/utils'   // FIXED: removed unused formatCurrency
import type { VishiAdmin } from '@/models/vishi'


export default function EditVishiPage({ id }: { id: number }) {
  const router = useRouter()
  const { data, isLoading } = useVishi(id)
  const update = useUpdateVishi(id)
  const remove = useDeleteVishi(id)
  const vishi  = data as VishiAdmin | undefined

  const [name,       setName]       = useState('')
  const [amount,     setAmount]     = useState('')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (vishi) {
      setName(vishi.name)
      setAmount(vishi.amount)
    }
  }, [vishi])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    update.mutate(
      { name: name.trim(), amount: amount.trim() },
      { onSuccess: () => router.back() }
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
      <div className="space-y-5 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold">Edit Vishi</h2>
              <p className="text-xs text-muted-foreground">{vishi.name}</p>
            </div>
          </div>
          {/* Delete only if upcoming — vishi defaults to active so this rarely shows */}
          {vishi.status === 'upcoming' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Editable fields */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Editable Fields</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Read-only info */}
          <Card className="rounded-xl bg-muted/50 border-dashed">
            <CardContent className="px-4 py-3">
              <p className="text-xs text-muted-foreground font-medium mb-2.5">
                Read-only after creation
              </p>
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

          <Button
            type="submit"
            className="w-full"
            disabled={update.isPending || !name.trim()}
          >
            {update.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : 'Save Changes'
            }
          </Button>
        </form>

        <ConfirmDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          title={`Delete "${vishi.name}"?`}
          description="This will permanently delete the vishi and all its data. This cannot be undone."
          confirmLabel="Delete Vishi"
          variant="destructive"
          onConfirm={handleDelete}
          loading={remove.isPending}
        />
      </div>
    </AdminRoute>
  )
}
