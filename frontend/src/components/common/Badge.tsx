import type { ReactNode } from 'react'
import { CircleCheck, CircleHelp, FlaskConical, LoaderCircle, ScanSearch, TriangleAlert } from 'lucide-react'
import type { AnalysisStatus, Outcome } from '@/types/domain'
import { cn } from '@/lib/format'

type Tone = 'success' | 'warn' | 'danger' | 'neutral' | 'processing' | 'brand'

const TONES: Record<Tone, string> = {
  success: 'bg-mint text-agro-dark ring-agro/15',
  warn: 'bg-warn-soft text-warn-ink ring-warn/25',
  danger: 'bg-danger-soft text-danger-ink ring-danger/20',
  neutral: 'bg-mist text-ink-soft ring-line-strong/70',
  processing: 'bg-[#EEF2F7] text-[#3B4C63] ring-[#C9D3E0]',
  brand: 'bg-forest text-white ring-forest',
}

export function Badge({ tone = 'neutral', icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', TONES[tone], className)}>
      {icon}
      {children}
    </span>
  )
}

export { STATUS_LABEL } from '@/lib/export'

export function StatusBadge({ status }: { status: AnalysisStatus }) {
  if (status === 'done')
    return (
      <Badge tone="success" icon={<CircleCheck className="size-3.5" aria-hidden />}>
        Concluído
      </Badge>
    )
  if (status === 'processing')
    return (
      <Badge tone="processing" icon={<LoaderCircle className="size-3.5 animate-spin" aria-hidden />}>
        Em processamento
      </Badge>
    )
  return (
    <Badge tone="neutral" icon={<CircleHelp className="size-3.5" aria-hidden />}>
      Inconclusivo
    </Badge>
  )
}

export function OutcomeBadge({ outcome, status }: { outcome: Outcome; status?: AnalysisStatus }) {
  if (status === 'processing') return <Badge tone="processing">Aguardando</Badge>
  if (outcome === 'healthy')
    return (
      <Badge tone="success" icon={<CircleCheck className="size-3.5" aria-hidden />}>
        Sem sinais
      </Badge>
    )
  if (outcome === 'disease')
    return (
      <Badge tone="warn" icon={<TriangleAlert className="size-3.5" aria-hidden />}>
        Possível doença
      </Badge>
    )
  return (
    <Badge tone="neutral" icon={<ScanSearch className="size-3.5" aria-hidden />}>
      Inconclusivo
    </Badge>
  )
}

export function DemoBadge({ className, label = 'Demonstração', dark }: { className?: string; label?: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-dashed px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        dark ? 'border-lime/40 bg-white/10 text-lime' : 'border-agro/40 bg-mint/70 text-agro-dark',
        className,
      )}
    >
      <FlaskConical className="size-3" aria-hidden />
      {label}
    </span>
  )
}
