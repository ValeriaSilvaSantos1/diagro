'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, BookMarked, CircleDot, History, SearchX, ShieldAlert } from 'lucide-react'
import { ButtonLink } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/Misc'
import { catalogById } from '@/lib/demo/catalog'
import { useAppStore } from '@/store/AppStore'

export default function CatalogDetail() {
  const { id } = useParams<{ id: string }>()
  const { analyses } = useAppStore()
  const entry = catalogById(decodeURIComponent(id))

  if (!entry)
    return (
      <Card>
        <EmptyState icon={<SearchX className="size-7" />} title="Classificação não encontrada" action={<ButtonLink href="/app/catalogo">Voltar ao catálogo</ButtonLink>} />
      </Card>
    )

  const related = analyses.filter((a) => a.catalogId === entry.id).length

  return (
    <div className="space-y-6">
      <Link href="/app/catalogo" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-ink">
        <ArrowLeft className="size-4" /> Catálogo de doenças
      </Link>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={entry.image.replace('w=900', 'w=1200')} alt={`Imagem ilustrativa: ${entry.name}`} className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Imagem ilustrativa de banco de fotos. Não representa necessariamente a classificação descrita.</p>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <Card className="p-6 sm:p-8">
            <h1 className="text-3xl font-extrabold text-ink">{entry.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Agente associado (referência geral): <em>{entry.agent}</em>
            </p>
            <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-muted-foreground">Descrição geral</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{entry.description}</p>

            <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-muted-foreground">Culturas associadas</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {entry.crops.map((c) => (
                <span key={c} className="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-agro-dark">
                  {c}
                </span>
              ))}
            </div>

            <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-muted-foreground">Sinais visuais frequentemente descritos</h2>
            <ul className="mt-2 space-y-2">
              {entry.signs.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-ink-soft">
                  <CircleDot className="mt-1 size-4 shrink-0 text-agro" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <ShieldAlert className="size-5 text-warn-ink" aria-hidden />
              <h3 className="mt-3 font-bold text-ink">Sem recomendações de tratamento</h3>
              <p className="mt-1 text-sm text-muted-foreground">Para definir qualquer manejo, consulte um profissional agrícola habilitado.</p>
            </Card>
            <Card className="p-5">
              <BookMarked className="size-5 text-agro" aria-hidden />
              <h3 className="mt-3 font-bold text-ink">Referências informativas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta ficha traz uma descrição geral. Para confirmar o diagnóstico, consulte um especialista.
              </p>
            </Card>
          </div>

          <Card className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-mint text-agro">
                <History className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-ink">{related} análises no seu histórico</p>
                <p className="text-sm text-muted-foreground">com esta classificação</p>
              </div>
            </div>
            <ButtonLink href={`/app/historico?q=${encodeURIComponent(entry.name)}`} variant="outline" size="sm">
              Ver no histórico
            </ButtonLink>
          </Card>
        </div>
      </div>
    </div>
  )
}
