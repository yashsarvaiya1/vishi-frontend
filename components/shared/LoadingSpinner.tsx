// components/shared/LoadingSpinner.tsx
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?:      'sm' | 'md' | 'lg'
  fullPage?:  boolean
  label?:     string
  className?: string
}

const SIZE = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-[2.5px]',
  lg: 'h-11 w-11 border-[3px]',
}

export default function LoadingSpinner({
  size = 'md', fullPage = false, label, className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className={cn(
        'rounded-full border-primary/25 border-t-primary animate-spin',
        SIZE[size]
      )} />
      {label && (
        <span className="text-sm text-muted-foreground font-medium animate-pulse">
          {label}
        </span>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64">
        {spinner}
      </div>
    )
  }

  return spinner
}
