import { CATALOG } from './catalog'
import { photo, type PhotoKey } from './images'
import type { Analysis, AppNotification, Crop, Outcome, Region } from '@/types/domain'

const DAY = 86_400_000

/** Deterministic PRNG so the demo dataset is stable between resets. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const DEMO_CROP_OPTIONS = ['Tomate', 'Milho', 'Soja', 'Feijão', 'Café', 'Trigo', 'Mandioca', 'Outra cultura']

export function seedCrops(now = Date.now()): Crop[] {
  return [
    {
      id: 'crop-tomate',
      name: 'Tomate',
      image: photo('tomato', 900),
      createdAt: new Date(now - 160 * DAY).toISOString(),
      property: 'Sítio Boa Esperança',
      area: '2,5 ha',
      notes: 'Estufa 1 e canteiro externo.',
    },
    {
      id: 'crop-milho',
      name: 'Milho',
      image: photo('corn', 900),
      createdAt: new Date(now - 140 * DAY).toISOString(),
      property: 'Sítio Boa Esperança',
      area: '8 ha',
    },
    {
      id: 'crop-soja',
      name: 'Soja',
      image: photo('soy', 900),
      createdAt: new Date(now - 120 * DAY).toISOString(),
      property: 'Sítio Boa Esperança',
      area: '12 ha',
    },
    {
      id: 'crop-feijao',
      name: 'Feijão',
      image: photo('bean', 900),
      createdAt: new Date(now - 96 * DAY).toISOString(),
      property: 'Sítio Boa Esperança',
      area: '3 ha',
      notes: 'Plantio da segunda safra.',
    },
  ]
}

const DISEASE_PHOTOS: PhotoKey[] = ['spotsBacklit', 'heroLeaf', 'spotsMacro', 'spotsBrown', 'spotsLong', 'spotsYellow', 'leafEdge', 'discolored']
const HEALTHY_PHOTOS: PhotoKey[] = ['healthyA', 'healthyB', 'healthyC', 'healthyD']
const INCONCLUSIVE_PHOTOS: PhotoKey[] = ['blurryLeaf', 'holes', 'mosaic']

const NOTES = [
  'Folhas da parte baixa da planta.',
  'Apareceu depois de uma semana de chuva.',
  'Talhão próximo ao açude.',
  'Comparar com a análise anterior.',
  'Foto tirada no fim da tarde.',
]

export function randomRegions(rand: () => number, count: number): Region[] {
  return Array.from({ length: count }, () => {
    const w = 14 + rand() * 14
    const h = 12 + rand() * 14
    return { x: 10 + rand() * (78 - w), y: 10 + rand() * (78 - h), w, h }
  })
}

export function seedAnalyses(crops: Crop[], now = Date.now()): Analysis[] {
  const rand = mulberry32(2025)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]
  const total = 128
  const weights = [0.38, 0.26, 0.22, 0.14]

  const items: Omit<Analysis, 'id'>[] = []
  for (let i = 0; i < total; i++) {
    // Skew toward recent days so the trend reflects growing usage.
    const dayOffset = Math.floor(Math.pow(rand(), 1.35) * 90)
    const created = now - dayOffset * DAY - Math.floor(rand() * 10 * 3600_000) - 2 * 3600_000
    let r = rand()
    let cropIdx = 0
    for (let k = 0; k < weights.length; k++) {
      if (r < weights[k]) {
        cropIdx = k
        break
      }
      r -= weights[k]
    }
    const crop = crops[cropIdx]
    const o = rand()
    const outcome: Outcome = o < 0.52 ? 'healthy' : o < 0.86 ? 'disease' : 'inconclusive'
    const options = CATALOG.filter((c) => c.crops.includes(crop.name))
    const entry = outcome === 'disease' ? pick(options.length ? options : CATALOG) : null

    items.push({
      createdAt: new Date(created).toISOString(),
      cropId: crop.id,
      cropName: crop.name,
      image: photo(
        outcome === 'disease' ? pick(DISEASE_PHOTOS) : outcome === 'healthy' ? pick(HEALTHY_PHOTOS) : pick(INCONCLUSIVE_PHOTOS),
        900,
        675,
      ),
      outcome,
      status: outcome === 'inconclusive' ? 'inconclusive' : 'done',
      classification:
        outcome === 'disease' ? `${entry!.name} (exemplo)` : outcome === 'healthy' ? 'Sem sinais identificados' : 'Resultado inconclusivo',
      catalogId: entry?.id ?? null,
      confidence: outcome === 'disease' ? 0.7 + rand() * 0.24 : outcome === 'healthy' ? 0.8 + rand() * 0.17 : 0.3 + rand() * 0.22,
      property: crop.property,
      notes: rand() < 0.35 ? pick(NOTES) : undefined,
      regions: outcome === 'disease' ? randomRegions(rand, 1 + Math.floor(rand() * 3)) : [],
      source: 'seed',
    })
  }

  items.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const withIds: Analysis[] = items.map((a, i) => ({ ...a, id: `AV-${String(i + 1).padStart(4, '0')}` }))

  // The two most recent records demonstrate the "processing" state.
  const last = withIds.length - 1
  for (const idx of [last, last - 1]) {
    withIds[idx] = {
      ...withIds[idx],
      createdAt: new Date(now - (last - idx + 1) * 18 * 60_000).toISOString(),
      status: 'processing',
      outcome: 'inconclusive',
      classification: 'Aguardando resultado',
      catalogId: null,
      confidence: null,
      regions: [],
      image: photo(idx === last ? 'spotsBacklit' : 'healthyB', 900, 675),
    }
  }
  // A highlighted, hand-tuned record used across the demo.
  const featured = last - 2
  withIds[featured] = {
    ...withIds[featured],
    createdAt: new Date(now - 5 * 3600_000).toISOString(),
    cropId: 'crop-tomate',
    cropName: 'Tomate',
    image: photo('spotsBacklit', 900, 675),
    outcome: 'disease',
    status: 'done',
    classification: 'Pinta-preta (exemplo)',
    catalogId: 'pinta-preta',
    confidence: 0.87,
    notes: 'Manchas apareceram nas folhas de baixo depois das chuvas.',
    regions: [
      { x: 52, y: 26, w: 12, h: 14 },
      { x: 15, y: 8, w: 18, h: 18 },
      { x: 66, y: 58, w: 14, h: 16 },
    ],
  }

  return withIds.reverse()
}

export function seedNotifications(now = Date.now()): AppNotification[] {
  return [
    {
      id: 'n1',
      title: 'Análise concluída',
      description: 'O registro de tomate foi classificado (exemplo demonstrativo).',
      createdAt: new Date(now - 5 * 3600_000).toISOString(),
      read: false,
      href: '/app/historico',
    },
    {
      id: 'n2',
      title: 'Duas análises em processamento',
      description: 'Os registros mais recentes ainda estão sendo processados.',
      createdAt: new Date(now - 30 * 60_000).toISOString(),
      read: false,
      href: '/app/historico',
    },
    {
      id: 'n3',
      title: 'Dica de fotografia',
      description: 'Fotos com boa luz natural ajudam a melhorar a qualidade das análises.',
      createdAt: new Date(now - 2 * DAY).toISOString(),
      read: true,
    },
  ]
}
