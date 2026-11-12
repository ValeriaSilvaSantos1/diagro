'use client'

import type { ReactNode } from 'react'
import { FlaskConical } from 'lucide-react'
import { cn } from '@/lib/format'

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: string; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-extrabold text-ink sm:text-[28px] sm:leading-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, description, action, className }: { icon: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      <div className="relative mb-5 grid size-16 place-items-center rounded-2xl bg-mint text-agro">
        <span className="absolute inset-0 rounded-2xl border border-dashed border-agro/30" />
        {icon}
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-line/80', className)} />
}

export function DemoNotice({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border border-dashed border-agro/35 bg-mint/50 px-4 py-3 text-sm text-ink-soft', className)}>
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-agro" aria-hidden />
      <p>
        {children ?? (
          <>
          </>
        )}
      </p>
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-lg bg-mist p-1 ring-1 ring-inset ring-line', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-[13px]',
            value === o.value ? 'bg-white text-forest shadow-sm ring-1 ring-line' : 'text-muted-foreground hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
