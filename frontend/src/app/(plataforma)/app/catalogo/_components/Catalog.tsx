'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, SearchX } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { DemoNotice, EmptyState, PageHeader } from '@/components/common/Misc'
import { Input } from '@/components/common/Field'
import { Button } from '@/components/common/Button'
import { CATALOG } from '@/lib/demo/catalog'
import { cn, normalize } from '@/lib/format'

export default function Catalog() {
  const [q, setQ] = useState('')
  const [crop, setCrop] = useState('Todas')
  const crops = useMemo(() => ['Todas', ...new Set(CATALOG.flatMap((c) => c.crops))], [])

  const list = CATALOG.filter((c) => {
    if (crop !== 'Todas' && !c.crops.includes(crop)) return false
    const t = normalize(q)
    return !t || normalize(`${c.name} ${c.summary} ${c.agent}`).includes(t)
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Catálogo de doenças" subtitle="Explore informações para compreender melhor os possíveis problemas identificados nas plantas." />
      <DemoNotice>
        <strong className="font-semibold text-forest">Conteúdo demonstrativo.</strong> As descrições são gerais, não foram validadas por especialistas e não trazem
        recomendações de tratamento.
      </DemoNotice>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <label htmlFor="cat-search" className="sr-only">
            Buscar no catálogo
          </label>
          <Input id="cat-search" leading={<Search className="size-4" />} placeholder="Buscar por nome ou sintoma" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por cultura">
          {crops.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={crop === c}
              onClick={() => setCrop(c)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset transition',
                crop === c ? 'bg-forest text-white ring-forest' : 'bg-white text-ink-soft ring-line hover:bg-mist',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchX className="size-7" />}
            title="Nenhuma classificação encontrada"
            description="Tente buscar por outro termo ou escolher outra cultura."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQ('')
                  setCrop('Todas')
                }}
              >
                Limpar busca
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((c) => (
            <article
              key={c.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-raised"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={`Imagem ilustrativa: ${c.name}`} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <span className="absolute left-3 top-3 rounded-md bg-forest-deep/70 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                  Imagem ilustrativa
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap gap-1.5">
                  {c.crops.map((cr) => (
                    <span key={cr} className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-agro-dark">
                      {cr}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 text-lg font-bold text-ink">{c.name}</h2>
                <p className="text-xs italic text-muted-foreground">{c.agent}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{c.summary}</p>
                <Link href={`/app/catalogo/${c.id}`} className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-agro hover:underline">
                  Ver detalhes <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
