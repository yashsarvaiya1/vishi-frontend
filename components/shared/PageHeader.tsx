// components/shared/PageHeader.tsx
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title:      string
  subtitle?:  string
  children?:  React.ReactNode
  className?: string
}

export default function PageHeader({
  title, subtitle, children, className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {children}
        </div>
      )}
    </div>
  )
}
