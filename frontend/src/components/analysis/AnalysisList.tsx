'use client'

import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, ChevronRight, Trash2 } from 'lucide-react'
import type { Analysis } from '@/types/domain'
import { cn, formatDate, formatPercent, formatTime } from '@/lib/format'
import { OutcomeBadge, StatusBadge } from '@/components/common/Badge'

interface Props {
  analyses: Analysis[]
  onDelete?: (a: Analysis) => void
  compact?: boolean
  sort?: { dir: 'desc' | 'asc'; onToggle: () => void }
}

const THUMB = { sm: 'size-10', md: 'size-12', lg: 'size-14' }

export function LeafThumb({ src, alt, size = 'md' }: { src: string; alt: string; size?: keyof typeof THUMB }) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-lg bg-mist ring-1 ring-line', THUMB[size])}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="size-full object-cover" />
    </div>
  )
}

/** Table on medium+ screens, stacked cards on small screens. Each record is clickable. */
export function AnalysisList({ analyses, onDelete, compact, sort }: Props) {
  const router = useRouter()
  const open = (a: Analysis) => router.push(`/app/analises/${a.id}`)

  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-3 pl-5 pr-3 font-semibold">
                Imagem
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Cultura
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Resultado
              </th>
              <th scope="col" className="px-3 py-3 font-semibold" aria-sort={sort ? (sort.dir === 'desc' ? 'descending' : 'ascending') : undefined}>
                {sort ? (
                  <button type="button" onClick={sort.onToggle} className="-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase tracking-wide hover:text-ink">
                    Data da análise
                    {sort.dir === 'desc' ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUp className="size-3.5" aria-hidden />}
                    <span className="sr-only">{sort.dir === 'desc' ? '(mais recentes primeiro)' : '(mais antigas primeiro)'}</span>
                  </button>
                ) : (
                  'Data da análise'
                )}
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="py-3 pl-3 pr-5 text-right font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((a) => (
              <tr key={a.id} onClick={() => open(a)} className="group cursor-pointer border-b border-line/70 transition last:border-0 hover:bg-mist/70">
                <td className={cn('pl-5 pr-3', compact ? 'py-2.5' : 'py-3')}>
                  <LeafThumb src={a.image} alt={`Folha de ${a.cropName}`} size={compact ? 'sm' : 'md'} />
                </td>
                <td className="px-3">
                  <p className="font-semibold text-ink">{a.cropName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{a.id}</p>
                </td>
                <td className="px-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium text-ink-soft">{a.classification}</span>
                    <span className="flex items-center gap-2">
                      <OutcomeBadge outcome={a.outcome} status={a.status} />
                      {a.confidence != null && a.status !== 'processing' && <span className="text-xs text-muted-foreground">conf. {formatPercent(a.confidence)}</span>}
                    </span>
                  </div>
                </td>
                <td className="px-3 text-ink-soft">
                  {formatDate(a.createdAt)}
                  <span className="block text-xs text-muted-foreground">{formatTime(a.createdAt)}</span>
                </td>
                <td className="px-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="pl-3 pr-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(a)
                        }}
                        className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-danger-soft hover:text-danger-ink focus-visible:opacity-100 group-hover:opacity-100"
                        aria-label={`Excluir análise ${a.id}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        open(a)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-agro transition hover:bg-mint"
                    >
                      Ver detalhes
                      <ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {analyses.map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => open(a)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-mist/70">
              <LeafThumb src={a.image} alt={`Folha de ${a.cropName}`} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-ink">{a.cropName}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(a.createdAt)}</span>
                </div>
                <p className="truncate text-sm text-ink-soft">{a.classification}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <StatusBadge status={a.status} />
                </div>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
