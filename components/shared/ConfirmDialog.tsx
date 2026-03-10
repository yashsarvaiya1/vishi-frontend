// components/shared/ConfirmDialog.tsx
'use client'

import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { useState } from 'react'

interface ConfirmDialogProps {
  open:          boolean
  onOpenChange:  (open: boolean) => void
  title:         string
  /** Plain text description — shown above details/children */
  description:   string
  /** Extra rich content rendered between description and footer (e.g. bullet-list of consequences) */
  children?:     React.ReactNode
  confirmLabel?: string
  cancelLabel?:  string
  onConfirm:     () => void
  loading?:      boolean
  variant?:      'default' | 'destructive'
  /**
   * If provided, user must type this exact string before confirming.
   * Used for irreversible actions like deleting a vishi (flow §4.5).
   */
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{description}</p>
              {children}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Type-to-confirm input (flow §4.5 — delete vishi) */}
        {confirmText && (
          <div className="space-y-1.5 px-0">
            <p className="text-xs text-muted-foreground">
              Type <span className="font-semibold text-foreground">{confirmText}</span> to confirm:
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmText}
              disabled={loading}
              autoComplete="off"
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
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
