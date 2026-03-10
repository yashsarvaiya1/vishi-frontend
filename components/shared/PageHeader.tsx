// components/shared/PageHeader.tsx
import { cn }        from '@/lib/utils'
import BackButton    from './BackButton'

interface PageHeaderProps {
  title:      string
  subtitle?:  string
  children?:  React.ReactNode
  className?: string
  /**
   * Show a back button.
   * - true        → router.back()
   * - "/some/path" → router.push(href)
   */
  back?:      boolean | string
}

export default function PageHeader({
  title, subtitle, children, className, back,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-6', className)}>
      <div className="flex items-start gap-1 min-w-0">
        {back !== undefined && (
          <BackButton
            href={typeof back === 'string' ? back : undefined}
            className="mt-0.5"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {children}
        </div>
      )}
    </div>
  )
}
  