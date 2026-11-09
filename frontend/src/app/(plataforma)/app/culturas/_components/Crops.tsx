'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Calendar, ClipboardList, EllipsisVertical, Pencil, Plus, ScanSearch, Sprout, Trash2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DemoBadge } from '@/components/common/Badge'
import { EmptyState, PageHeader } from '@/components/common/Misc'
import { Card } from '@/components/common/Card'
import { Dropdown, MenuItem } from '@/components/common/Dropdown'
import { ConfirmDialog } from '@/components/common/Modal'
import { useToast } from '@/components/common/Toast'
import { CropForm, analysesForCrop } from '@/components/crops/CropForm'
import { useAppStore } from '@/store/AppStore'
import type { Analysis, Crop } from '@/types/domain'
import { formatDate } from '@/lib/format'

export default function Crops() {
  const { crops, analyses, addCrop, updateCrop, deleteCrop } = useAppStore()
  const toast = useToast()
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<Crop | null>(null)
  const [toDelete, setToDelete] = useState<Crop | null>(null)

  const summary = useMemo(
    () =>
      Object.fromEntries(
        crops.map((c) => {
          const list = analysesForCrop(analyses, c)
          return [c.id, { count: list.length, last: list[0] as Analysis | undefined }]
        }),
      ),
    [crops, analyses],
  )

  const openForm = (crop: Crop | null) => {
    setEditing(crop)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }
  const openNew = () => openForm(null)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<DemoBadge label="Dados demonstrativos" />}
        title="Minhas culturas"
        subtitle="Organize suas culturas e acompanhe as análises relacionadas a cada uma."
        actions={
          <Button size="lg" icon={<Plus className="size-5" />} onClick={openNew}>
            Adicionar cultura
          </Button>
        }
      />

      {crops.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Sprout className="size-7" />}
            title="Nenhuma cultura cadastrada"
            description="Cadastre as culturas que você acompanha para organizar suas análises."
            action={
              <Button onClick={openNew} icon={<Plus className="size-4" />}>
                Adicionar cultura
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {crops.map((c) => {
            const s = summary[c.id]
            return (
              <article
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-raised"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={`Plantação de ${c.name}`} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/10 to-transparent" />
                  <div className="absolute right-3 top-3">
                    <Dropdown
                      label={`Ações para ${c.name}`}
                      buttonClassName="grid size-9 place-items-center rounded-lg bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white"
                      button={<EllipsisVertical className="size-4" />}
                    >
                      {(close) => (
                        <>
                          <MenuItem
                            icon={<ScanSearch className="size-4" />}
                            onClick={() => {
                              close()
                              router.push(`/app/nova-analise?cultura=${c.id}`)
                            }}
                          >
                            Nova análise
                          </MenuItem>
                          <MenuItem
                            icon={<Pencil className="size-4" />}
                            onClick={() => {
                              close()
                              openForm(c)
                            }}
                          >
                            Editar
                          </MenuItem>
                          <MenuItem
                            danger
                            icon={<Trash2 className="size-4" />}
                            onClick={() => {
                              close()
                              setToDelete(c)
                            }}
                          >
                            Excluir
                          </MenuItem>
                        </>
                      )}
                    </Dropdown>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5">
                    <h2 className="font-display text-2xl font-extrabold text-white">{c.name}</h2>
                    {c.property && <p className="text-sm text-white/80">{c.property}</p>}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ClipboardList className="size-3.5" /> Análises
                      </dt>
                      <dd className="mt-0.5 font-display text-xl font-extrabold text-ink">{s.count}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" /> Última análise
                      </dt>
                      <dd className="mt-1 font-semibold text-ink">{s.last ? formatDate(s.last.createdAt) : 'Nenhuma ainda'}</dd>
                    </div>
                  </dl>
                  <Link href={`/app/culturas/${c.id}`} className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-agro hover:underline">
                    Ver detalhes <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            )
          })}
          <button
            type="button"
            onClick={openNew}
            className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line-strong bg-white/50 p-6 text-center transition hover:border-agro/50 hover:bg-mint/40"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-mint text-agro">
              <Plus className="size-6" />
            </span>
            <span className="font-display text-lg font-bold text-ink">Adicionar cultura</span>
            <span className="max-w-56 text-sm text-muted-foreground">Organize novas análises por cultura</span>
          </button>
        </div>
      )}

      <CropForm
        key={formKey}
        open={formOpen}
        initial={editing}
        existing={crops}
        onClose={() => setFormOpen(false)}
        onSubmit={(data) => {
          if (editing) {
            updateCrop(editing.id, data)
            toast({ title: 'Cultura atualizada', description: `${data.name} foi salva.` })
          } else {
            addCrop(data)
            toast({ title: 'Cultura adicionada', description: `${data.name} agora aparece nas suas culturas.` })
          }
          setFormOpen(false)
        }}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Excluir ${toDelete?.name ?? 'cultura'}?`}
        description="A cultura será removida. As análises relacionadas continuam no histórico, mas deixam de estar associadas a ela."
        confirmLabel="Excluir cultura"
        onConfirm={() => {
          if (!toDelete) return
          deleteCrop(toDelete.id)
          toast({ title: 'Cultura excluída', tone: 'info' })
        }}
      />
    </div>
  )
}
