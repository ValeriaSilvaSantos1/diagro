'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowRight,
  Calendar,
  CircleCheck,
  Download,
  Gauge,
  Hash,
  History,
  Info,
  LayoutDashboard,
  MapPinned,
  MessageSquareText,
  Plus,
  RefreshCw,
  ScanSearch,
  SearchX,
  Sprout,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { Button, ButtonLink } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { OutcomeBadge, StatusBadge } from '@/components/common/Badge'
import { EmptyState, PageHeader, Skeleton } from '@/components/common/Misc'
import { ConfirmDialog } from '@/components/common/Modal'
import { useToast } from '@/components/common/Toast'
import { ScanImage } from '@/components/analysis/ScanOverlay'
import { useAppStore } from '@/store/AppStore'
import type { Analysis } from '@/types/domain'
import { analysisReportHtml, downloadFile } from '@/lib/export'
import { cn, formatDateTime } from '@/lib/format'

export default function AnalysisResult() {
  const { id } = useParams<{ id: string }>()
  const { analyses, deleteAnalysis } = useAppStore()
  const router = useRouter()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  const a = analyses.find((x) => x.id === decodeURIComponent(id))

  if (!a)
    return (
      <Card>
        <EmptyState
          icon={<SearchX className="size-7" />}
          title="Análise não encontrada"
          description="Este registro pode ter sido excluído ou o endereço está incorreto."
          action={<ButtonLink href="/app/historico">Consultar histórico</ButtonLink>}
        />
      </Card>
    )

  const download = () => {
    downloadFile(`relatorio-${a.id}-demonstrativo.html`, analysisReportHtml(a), 'text/html;charset=utf-8')
    toast({ title: 'Relatório demonstrativo baixado', description: 'O arquivo pode ser aberto no navegador ou impresso.' })
  }

  const newHref = `/app/nova-analise${a.cropId ? `?cultura=${a.cropId}` : ''}`

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resultado da análise"
        subtitle="Confira as informações identificadas na imagem enviada."
        actions={
          <>
            <ButtonLink href="/app/historico" variant="outline" icon={<History className="size-4" />}>
              Consultar histórico
            </ButtonLink>
            <Button variant="outline" icon={<Download className="size-4" />} onClick={download} disabled={a.status === 'processing'}>
              Baixar relatório
            </Button>
            <ButtonLink href={newHref} icon={<Plus className="size-4" />}>
              Realizar nova análise
            </ButtonLink>
          </>
        }
      />

      <dl className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white p-3 shadow-card md:grid-cols-4">
        <Meta icon={<Calendar className="size-4" />} label="Data da análise" value={formatDateTime(a.createdAt)} />
        <Meta icon={<Sprout className="size-4" />} label="Cultura informada" value={a.cropName} />
        <Meta icon={<Hash className="size-4" />} label="Registro" value={<span className="font-mono">{a.id}</span>} />
        <Meta icon={<Gauge className="size-4" />} label="Processamento" value={<StatusBadge status={a.status} />} />
      </dl>

      {a.status === 'processing' ? (
        <ProcessingState a={a} />
      ) : a.status === 'inconclusive' ? (
        <InconclusiveState a={a} newHref={newHref} />
      ) : (
        <DoneState a={a} />
      )}

      <div className="flex justify-end">
        <Button variant="dangerGhost" size="sm" icon={<Trash2 className="size-4" />} onClick={() => setConfirm(true)}>
          Excluir registro
        </Button>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Excluir esta análise?"
        description={`O registro ${a.id} será removido do histórico. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir análise"
        onConfirm={() => {
          deleteAnalysis(a.id)
          toast({ title: 'Análise excluída', tone: 'info' })
          router.replace('/app/historico')
        }}
      />
    </div>
  )
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-2">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-agro">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 truncate text-sm font-semibold text-ink">{value}</dd>
      </div>
    </div>
  )
}

function SupportNote() {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
      <Info className="mt-px size-4 shrink-0 text-agro" aria-hidden />A classificação da inteligência artificial é uma ferramenta de apoio e não substitui a avaliação
      de um profissional agrícola.
    </p>
  )
}

function ConfidenceMeter({ value }: { value: number | null }) {
  const pct = value == null ? 0 : Math.round(value * 100)
  const level = pct >= 80 ? 'alta' : pct >= 60 ? 'moderada' : 'baixa'
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Confiança informada pelo modelo</p>
          <p className="text-xs text-muted-foreground">Confiança {level} · valor ilustrativo</p>
        </div>
        <span className="font-display text-3xl font-extrabold text-ink">{value == null ? '—' : `${pct}%`}</span>
      </div>
      <div
        className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-mist ring-1 ring-inset ring-line"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Confiança informada pelo modelo"
      >
        <div className="h-full origin-left animate-draw rounded-full bg-agro" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Indica o quanto o modelo está seguro da classificação. Não é a probabilidade garantida de a planta ter a doença.
      </p>
    </div>
  )
}

function DoneState({ a }: { a: Analysis }) {
  const [showMarks, setShowMarks] = useState(true)
  const disease = a.outcome === 'disease'

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="h-fit overflow-hidden lg:col-span-7">
        <ScanImage src={a.image} alt={`Folha de ${a.cropName} analisada`} regions={showMarks ? a.regions : []} tone="warn" className="aspect-[4/3]" />
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
          <div className="flex items-start gap-3 text-sm">
            <span className="mt-1 size-3.5 shrink-0 rounded-[3px] border-[1.5px] border-dashed border-warn bg-warn/15" aria-hidden />
            <p className="text-ink-soft">
              {a.regions.length ? (
                <>
                  <strong className="font-semibold text-ink">{a.regions.length} regiões de interesse</strong> (ilustrativas): áreas que influenciaram a classificação.
                </>
              ) : (
                'Nenhuma região de interesse destacada nesta imagem.'
              )}
            </p>
          </div>
          {a.regions.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowMarks(!showMarks)} aria-pressed={showMarks}>
              {showMarks ? 'Ocultar marcações' : 'Mostrar marcações'}
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-6 lg:col-span-5">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Classificação retornada</p>
          </div>
          <div className="mt-4 flex items-start gap-4">
            <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl', disease ? 'bg-warn-soft text-warn-ink' : 'bg-mint text-agro')}>
              {disease ? <TriangleAlert className="size-6" aria-hidden /> : <CircleCheck className="size-6" aria-hidden />}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-extrabold leading-snug text-ink">
                {disease ? 'Possíveis sinais de doença identificados' : 'Nenhum sinal de doença identificado'}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <OutcomeBadge outcome={a.outcome} />
                <span className="text-sm font-semibold text-ink-soft">{a.classification}</span>
              </div>
            </div>
          </div>

          <div className="my-5 border-t border-line" />
          <ConfidenceMeter value={a.confidence} />

          <div className={cn('mt-5 rounded-lg p-4', disease ? 'bg-warn-soft/70' : 'bg-mint/70')}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
              <MessageSquareText className="size-4 text-agro" aria-hidden /> Em linguagem simples
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {disease
                ? 'Esta classificação foi gerada por um modelo de inteligência artificial e precisa ser interpretada considerando as condições da cultura e o contexto da plantação. Se os sinais persistirem ou se espalharem, procure orientação de um profissional agrícola.'
                : 'O modelo não encontrou, nesta imagem, sinais visuais associados às classificações conhecidas. Isso não garante que a planta esteja saudável: continue acompanhando a lavoura.'}
            </p>
          </div>
          <div className="mt-4">
            <SupportNote />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-bold text-ink">Detalhes do registro</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            <DetailRow icon={<MapPinned className="size-4" />} label="Propriedade" value={a.property || 'Não informada'} />
            <DetailRow icon={<MessageSquareText className="size-4" />} label="Observações" value={a.notes || 'Nenhuma observação'} />
          </dl>
        </Card>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2.5">
      <dt className="flex w-32 shrink-0 items-center gap-2 text-muted-foreground">
        <span className="text-agro">{icon}</span>
        {label}
      </dt>
      <dd className="text-ink">{value}</dd>
    </div>
  )
}

function InconclusiveState({ a, newHref }: { a: Analysis; newHref: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="h-fit overflow-hidden lg:col-span-6">
        <ScanImage src={a.image} alt={`Folha de ${a.cropName} enviada`} className="aspect-[4/3]" />
      </Card>
      <Card className="flex flex-col p-6 sm:p-8 lg:col-span-6">
        <span className="grid size-14 place-items-center rounded-2xl bg-mist text-ink-soft ring-1 ring-line">
          <ScanSearch className="size-7" aria-hidden />
        </span>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <OutcomeBadge outcome="inconclusive" />
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-ink">Não foi possível identificar um resultado confiável.</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Você pode tentar uma nova fotografia: use uma imagem mais nítida, com melhor iluminação e foco na região afetada. Se a dúvida persistir, procure orientação de um
          profissional agrícola.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-ink-soft">
          {['Luz natural, sem sombras fortes', 'Câmera próxima da região com sinais', 'Apenas uma folha no enquadramento'].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <CircleCheck className="size-4 text-agro" aria-hidden /> {t}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href={newHref} icon={<RefreshCw className="size-4" />}>
            Tentar nova fotografia
          </ButtonLink>
          <ButtonLink href="/app" variant="outline" icon={<LayoutDashboard className="size-4" />}>
            Voltar ao início
          </ButtonLink>
        </div>
        <div className="mt-6 border-t border-line pt-4">
          <SupportNote />
        </div>
      </Card>
    </div>
  )
}

function ProcessingState({ a }: { a: Analysis }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="h-fit overflow-hidden lg:col-span-7">
        <ScanImage src={a.image} alt={`Folha de ${a.cropName} em processamento`} className="aspect-[4/3]" tone="lime" scanning />
      </Card>
      <Card className="flex flex-col p-6 sm:p-8 lg:col-span-5">
        <StatusBadge status="processing" />
        <h2 className="mt-4 font-display text-2xl font-extrabold text-ink">Análise em processamento</h2>
        <p className="mt-2 text-ink-soft">A imagem foi recebida e o resultado ficará disponível em breve. Você pode sair desta página.</p>
        <div className="mt-6 space-y-3" aria-hidden>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </Card>
    </div>
  )
}
