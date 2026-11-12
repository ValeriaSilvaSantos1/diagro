'use client'

import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ClipboardList, ImagePlus, LoaderCircle, Plus, ScanSearch, Sprout, TriangleAlert } from 'lucide-react'
import { ButtonLink } from '@/components/common/Button'
import { Card, CardHeader } from '@/components/common/Card'
import { EmptyState, PageHeader } from '@/components/common/Misc'
import { useToast } from '@/components/common/Toast'
import { AnalysisList } from '@/components/analysis/AnalysisList'
import { loadImageFile } from '@/components/analysis/ImageUploader'
import { useAppStore } from '@/store/AppStore'
import { withinDays } from '@/lib/analytics'
import { pendingImage } from '@/lib/handoff'
import { cn, firstName } from '@/lib/format'

export default function Dashboard() {
  const { user, analyses, crops } = useAppStore()

  const attention = useMemo(() => analyses.filter((a) => withinDays(a, 14) && a.status !== 'processing' && a.outcome !== 'healthy').length, [analyses])
  const latest = analyses.slice(0, 6)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${firstName(user.name)}!`}
        subtitle="Vamos acompanhar a saúde das suas plantas?"
        actions={
          <ButtonLink href="/app/nova-analise" size="lg" icon={<Plus className="size-5" strokeWidth={2.4} />}>
            Nova análise
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <Stat icon={<ClipboardList className="size-5" />} label="Análises realizadas" value={analyses.length} hint="Total na sua conta" />
        <Stat icon={<Sprout className="size-5" />} label="Culturas acompanhadas" value={crops.length} hint={crops.map((c) => c.name).join(', ') || 'Nenhuma cadastrada'} />
        <Stat tone="warn" icon={<TriangleAlert className="size-5" />} label="Precisam de atenção" value={attention} hint="Possíveis sinais ou inconclusivas · 14 dias" />
        <QuickAnalyze className="sm:col-span-3 xl:col-span-1" />
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 pb-3 sm:p-6 sm:pb-4">
          <CardHeader
            title="Últimas análises"
            description="Clique em um registro para ver o resultado"
            actions={
              <ButtonLink href="/app/historico" variant="outline" size="sm">
                Ver histórico completo
                <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />
        </div>
        {latest.length ? (
          <AnalysisList analyses={latest} />
        ) : (
          <EmptyState
            icon={<ScanSearch className="size-7" />}
            title="Nenhuma análise ainda"
            description="Envie a foto de uma folha para começar a acompanhar suas culturas."
            action={<ButtonLink href="/app/nova-analise">Realizar primeira análise</ButtonLink>}
          />
        )}
      </Card>
    </div>
  )
}

function Stat({ icon, label, value, hint, tone = 'default' }: { icon: ReactNode; label: string; value: number; hint: string; tone?: 'default' | 'warn' }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-line bg-white p-5 shadow-card">
      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', tone === 'warn' ? 'bg-warn-soft text-warn-ink' : 'bg-mint text-agro')}>{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-display text-3xl font-extrabold leading-tight text-ink">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground" title={hint}>
          {hint}
        </p>
      </div>
    </div>
  )
}

/** Discreet entry point: click to open the analysis screen, or drop a photo to start right away. */
function QuickAnalyze({ className }: { className?: string }) {
  const router = useRouter()
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      const image = await loadImageFile(file)
      pendingImage.set(image)
      router.push('/app/nova-analise')
    } catch (e) {
      toast({ title: 'Não foi possível usar esta imagem', description: (e as Error).message, tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          handle(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handle(e.dataTransfer.files?.[0])
        }}
        className={cn(
          'flex h-full w-full items-center gap-4 rounded-xl border-2 border-dashed p-5 text-left transition',
          dragging ? 'border-agro bg-mint' : 'border-agro/30 bg-mint/40 hover:border-agro/60 hover:bg-mint/70',
        )}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-agro ring-1 ring-agro/15">
          {busy ? <LoaderCircle className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-forest">Analisar uma folha</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{dragging ? 'Solte para iniciar' : 'Solte uma foto aqui ou clique para enviar'}</span>
        </span>
      </button>
    </div>
  )
}
