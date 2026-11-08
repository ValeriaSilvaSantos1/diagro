'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/format'

export function Pagination({ page, pages, total, perPage, onChange }: { page: number; pages: number; total: number; perPage: number; onChange: (p: number) => void }) {
  if (total === 0) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(total, page * perPage)
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Mostrando{' '}
        <strong className="font-semibold text-ink">
          {from}–{to}
        </strong>{' '}
        de <strong className="font-semibold text-ink">{total}</strong>
      </p>
      <nav className="flex items-center gap-1" aria-label="Paginação">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="grid size-9 place-items-center rounded-lg text-ink-soft transition hover:bg-mist disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        {nums.map((n, i) => (
          <span key={n} className="flex items-center">
            {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
            <button
              type="button"
              onClick={() => onChange(n)}
              aria-current={n === page ? 'page' : undefined}
              className={cn('grid size-9 place-items-center rounded-lg text-sm font-semibold transition', n === page ? 'bg-forest text-white' : 'text-ink-soft hover:bg-mist')}
            >
              {n}
            </button>
          </span>
        ))}
        <button
          type="button"
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
          className="grid size-9 place-items-center rounded-lg text-ink-soft transition hover:bg-mist disabled:opacity-40"
          aria-label="Próxima página"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  )
}
