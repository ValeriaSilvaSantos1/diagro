import { Check, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/format'

export const PROCESSING_STEPS = ['Enviando imagem', 'Processando imagem', 'Interpretando resultado', 'Preparando diagnóstico']

export function ProcessingSteps({ current }: { current: number }) {
  const progress = Math.min(100, ((current + 0.5) / PROCESSING_STEPS.length) * 100)
  return (
    <div>
      <div className="mb-5 flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">Progresso da análise</span>
        <span className="font-mono text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-mist ring-1 ring-inset ring-line"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da análise"
      >
        <div className="h-full rounded-full bg-gradient-to-r from-agro to-lime transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <ol className="mt-6 space-y-1">
        {PROCESSING_STEPS.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'todo'
          return (
            <li key={step} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 transition', state === 'active' && 'bg-mint')} aria-current={state === 'active' ? 'step' : undefined}>
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition',
                  state === 'done' && 'bg-agro text-white',
                  state === 'active' && 'bg-white text-agro ring-2 ring-agro',
                  state === 'todo' && 'bg-mist text-muted-foreground ring-1 ring-line',
                )}
              >
                {state === 'done' ? <Check className="size-4" strokeWidth={3} /> : state === 'active' ? <LoaderCircle className="size-4 animate-spin" /> : i + 1}
              </span>
              <span className={cn('text-sm', state === 'todo' ? 'text-muted-foreground' : 'font-semibold text-ink')}>{step}</span>
              <span className="ml-auto text-xs text-muted-foreground">{state === 'done' ? 'Concluído' : state === 'active' ? 'Em andamento' : 'Aguardando'}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
