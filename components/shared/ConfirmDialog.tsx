// components/shared/ConfirmDialog.tsx
'use client'

import { useState }  from 'react'
import { Loader2 }   from 'lucide-react'
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'

interface ConfirmDialogProps {
  open:          boolean
  onOpenChange:  (open: boolean) => void
  title:         string
  description:   string
  children?:     React.ReactNode
  confirmLabel?: string
  cancelLabel?:  string
  onConfirm:     () => void
  loading?:      boolean
  variant?:      'default' | 'destructive'
  confirmText?:  string
}

export default function ConfirmDialog({
  open, onOpenChange, title, description,
  children,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, loading = false, variant = 'default',
  confirmText,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const canConfirm = !confirmText || typed === confirmText

  const handleOpenChange = (val: boolean) => {
    if (!val) setTyped('')
    onOpenChange(val)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{description}</p>
              {children}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {confirmText && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              Type{' '}
              <span className="font-semibold text-foreground font-mono bg-muted px-1 py-0.5 rounded">
                {confirmText}
              </span>{' '}
              to confirm:
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmText}
              disabled={loading}
              autoComplete="off"
              className="font-mono"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={() => setTyped('')}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading || !canConfirm}
            className="min-w-20"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : confirmLabel
            }
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
