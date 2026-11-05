import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/format'

export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cn('rounded-xl border border-line bg-white shadow-card', className)} {...rest} />
}

export function CardHeader({ title, description, actions, className }: { title: string; description?: string; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
