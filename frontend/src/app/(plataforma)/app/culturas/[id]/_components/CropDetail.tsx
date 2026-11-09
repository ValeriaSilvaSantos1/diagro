'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Calendar, ClipboardList, MapPinned, Pencil, Ruler, ScanSearch, SearchX, Trash2, TriangleAlert } from 'lucide-react'
import { Button, ButtonLink } from '@/components/common/Button'
import { Card, CardHeader } from '@/components/common/Card'
import { DemoBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/Misc'
import { ConfirmDialog } from '@/components/common/Modal'
import { useToast } from '@/components/common/Toast'
import { AnalysisList } from '@/components/analysis/AnalysisList'
import { CropForm, analysesForCrop } from '@/components/crops/CropForm'
import { useAppStore } from '@/store/AppStore'
import { formatDate, formatRelative } from '@/lib/format'

export default function CropDetail() {
  const { id } = useParams<{ id: string }>()
  const { crops, analyses, updateCrop, deleteCrop } = useAppStore()
  const toast = useToast()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const crop = crops.find((c) => c.id === decodeURIComponent(id))

  const related = useMemo(() => (crop ? analysesForCrop(analyses, crop) : []), [crop, analyses])

  if (!crop)
    return (
      <Card>
        <EmptyState
          icon={<SearchX className="size-7" />}
          title="Cultura não encontrada"
          description="Ela pode ter sido excluída."
          action={<ButtonLink href="/app/culturas">Voltar às culturas</ButtonLink>}
        />
      </Card>
    )

  const attention = related.filter((a) => a.outcome === 'disease' && a.status === 'done').length
  const inconclusive = related.filter((a) => a.status === 'inconclusive').length

  return (
    <div className="space-y-6">
      <Link href="/app/culturas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-ink">
        <ArrowLeft className="size-4" /> Minhas culturas
      </Link>

      <section className="relative overflow-hidden rounded-2xl bg-forest text-white shadow-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={crop.image} alt={`Plantação de ${crop.name}`} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/75 to-forest-deep/20" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <DemoBadge dark label="Dados demonstrativos" />
            <h1 className="mt-3 font-display text-4xl font-extrabold">{crop.name}</h1>
            <p className="mt-1 text-white/75">{crop.property ?? 'Propriedade não informada'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="light" icon={<Pencil className="size-4" />} onClick={() => {
                setFormKey((k) => k + 1)
                setEditOpen(true)
              }}>
              Editar
            </Button>
            <ButtonLink href={`/app/nova-analise?cultura=${crop.id}`} variant="lime" icon={<ScanSearch className="size-4" />}>
              Nova análise para esta cultura
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="h-fit p-5 sm:p-6 lg:col-span-4">
          <CardHeader title="Informações cadastradas" />
          <dl className="mt-5 space-y-4 text-sm">
            <Row icon={<Calendar className="size-4" />} label="Data de cadastro" value={formatDate(crop.createdAt)} />
            <Row icon={<MapPinned className="size-4" />} label="Propriedade" value={crop.property ?? 'Não informada'} />
            <Row icon={<Ruler className="size-4" />} label="Área plantada" value={crop.area ?? 'Não informada'} />
            <div>
              <dt className="text-xs text-muted-foreground">Observações</dt>
              <dd className="mt-1 rounded-lg bg-mist p-3 text-ink-soft">{crop.notes ?? 'Nenhuma observação.'}</dd>
            </div>
          </dl>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-center">
            <Mini icon={<ClipboardList className="size-4" />} label="Análises" value={related.length} />
            <Mini icon={<TriangleAlert className="size-4" />} label="Possíveis" value={attention} />
            <Mini icon={<SearchX className="size-4" />} label="Inconcl." value={inconclusive} />
          </div>
          <button type="button" onClick={() => setConfirm(true)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-danger-ink hover:underline">
            <Trash2 className="size-4" /> Excluir cultura
          </button>
        </Card>

        <Card className="overflow-hidden lg:col-span-8">
          <div className="p-5 pb-3 sm:p-6 sm:pb-4">
            <CardHeader
              title="Análises desta cultura"
              description={related[0] ? `Última análise ${formatRelative(related[0].createdAt)}` : 'Nenhuma análise para esta cultura'}
              actions={
                related.length > 8 && (
                  <ButtonLink href={`/app/historico?cultura=${encodeURIComponent(crop.name)}`} variant="outline" size="sm">
                    Ver todas no histórico <ArrowRight className="size-4" />
                  </ButtonLink>
                )
              }
            />
          </div>
          {related.length ? (
            <AnalysisList analyses={related.slice(0, 8)} compact />
          ) : (
            <EmptyState
              icon={<ScanSearch className="size-7" />}
              title="Nenhuma análise para esta cultura"
              description="Inicie uma análise já associada a esta cultura."
              action={<ButtonLink href={`/app/nova-analise?cultura=${crop.id}`}>Iniciar nova análise</ButtonLink>}
            />
          )}
        </Card>
      </div>

      <CropForm
        key={formKey}
        open={editOpen}
        initial={crop}
        existing={crops}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => {
          updateCrop(crop.id, data)
          setEditOpen(false)
          toast({ title: 'Cultura atualizada' })
        }}
      />
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Excluir ${crop.name}?`}
        description="A cultura será removida. As análises relacionadas continuam no histórico."
        confirmLabel="Excluir cultura"
        onConfirm={() => {
          deleteCrop(crop.id)
          toast({ title: 'Cultura excluída', tone: 'info' })
          router.replace('/app/culturas')
        }}
      />
    </div>
  )
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 place-items-center rounded-lg bg-mint text-agro">{icon}</span>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-semibold text-ink">{value}</dd>
      </div>
    </div>
  )
}

function Mini({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-mist px-2 py-3">
      <span className="mx-auto flex justify-center text-agro">{icon}</span>
      <p className="mt-1 font-display text-xl font-extrabold text-ink">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
