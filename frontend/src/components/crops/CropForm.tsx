'use client'

import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Field, Input } from '@/components/common/Field'
import type { Analysis, Crop } from '@/types/domain'
import { DEMO_CROP_OPTIONS } from '@/lib/demo/seed'
import { photo, type PhotoKey } from '@/lib/demo/images'
import { normalize } from '@/lib/format'

const CROP_PHOTOS: Record<string, PhotoKey> = {
  tomate: 'tomato',
  milho: 'corn',
  soja: 'soy',
  feijao: 'bean',
  cafe: 'coffee',
}

export const cropPhoto = (name: string) => photo(CROP_PHOTOS[normalize(name)] ?? 'greenFarm', 900)

export const analysesForCrop = (analyses: Analysis[], crop: Crop) =>
  analyses.filter((a) => a.cropId === crop.id || (!a.cropId && normalize(a.cropName) === normalize(crop.name)))

export type CropInput = Omit<Crop, 'id' | 'createdAt'>

export function CropForm({
  open,
  onClose,
  onSubmit,
  initial,
  existing,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (c: CropInput) => void
  initial?: Crop | null
  existing: Crop[]
}) {
  // Os campos começam com os dados da cultura; quem abre o formulário troca a `key` a cada abertura.
  const [name, setName] = useState(initial?.name ?? '')
  const [property, setProperty] = useState(initial?.property ?? '')
  const [area, setArea] = useState(initial?.area ?? '')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (n.length < 2) return setError('Informe o nome da cultura.')
    if (existing.some((c) => c.id !== initial?.id && normalize(c.name) === normalize(n))) return setError('Você já cadastrou uma cultura com este nome.')
    onSubmit({
      name: n.charAt(0).toUpperCase() + n.slice(1),
      property: property.trim() || undefined,
      area: area.trim() || undefined,
      notes: initial?.notes,
      image: initial && normalize(initial.name) === normalize(n) ? initial.image : cropPhoto(n),
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Editar cultura' : 'Adicionar cultura'}
      description={initial ? 'Atualize as informações desta cultura.' : 'Só o nome é obrigatório. Você pode completar o resto depois.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="crop-form">
            {initial ? 'Salvar alterações' : 'Adicionar cultura'}
          </Button>
        </>
      }
    >
      <form id="crop-form" onSubmit={submit} noValidate className="space-y-4">
        <Field label="Nome da cultura" htmlFor="crop-name" error={error}>
          <Input
            id="crop-name"
            list="crop-suggestions"
            placeholder="Ex.: Tomate"
            value={name}
            invalid={!!error}
            data-autofocus
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
          />
          <datalist id="crop-suggestions">
            {DEMO_CROP_OPTIONS.filter((o) => o !== 'Outra cultura').map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da propriedade" htmlFor="crop-property" optional>
            <Input id="crop-property" placeholder="Ex.: Sítio Boa Esperança" value={property} onChange={(e) => setProperty(e.target.value)} />
          </Field>
          <Field label="Área plantada" htmlFor="crop-area" optional>
            <Input id="crop-area" placeholder="Ex.: 2,5 ha" value={area} onChange={(e) => setArea(e.target.value)} />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
