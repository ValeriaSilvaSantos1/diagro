import type { Analysis, Outcome } from '@/types/domain'
import { formatShortDate } from './format'

const DAY = 86_400_000

export const OUTCOME_META: Record<Outcome, { label: string; color: string }> = {
  healthy: { label: 'Sem sinais identificados', color: '#2E7D3A' },
  disease: { label: 'Possíveis doenças', color: '#E9A23B' },
  inconclusive: { label: 'Resultado inconclusivo', color: '#9AA8A0' },
}

export const CROP_COLORS = ['#0B3B2C', '#2E7D3A', '#79B04B', '#A7CC5C', '#5C8F73', '#A3C9A8']

export const withinDays = (a: Analysis, days: number, now = Date.now()) => now - new Date(a.createdAt).getTime() <= days * DAY

export interface SeriesPoint {
  label: string
  total: number
  healthy: number
  disease: number
  inconclusive: number
}

/** Daily buckets for <= 30 days, weekly buckets for longer ranges. */
export function buildSeries(analyses: Analysis[], days: number, now = Date.now()): SeriesPoint[] {
  const bucket = days > 30 ? 7 : 1
  const count = Math.ceil(days / bucket)
  const start = new Date(now)
  start.setHours(23, 59, 59, 999)
  const end = start.getTime()
  const points: SeriesPoint[] = Array.from({ length: count }, (_, i) => {
    const bucketEnd = end - (count - 1 - i) * bucket * DAY
    const labelDate = new Date(bucketEnd - (bucket - 1) * DAY)
    return { label: formatShortDate(labelDate), total: 0, healthy: 0, disease: 0, inconclusive: 0 }
  })
  for (const a of analyses) {
    if (a.status === 'processing') continue
    const age = end - new Date(a.createdAt).getTime()
    const idx = count - 1 - Math.floor(age / (bucket * DAY))
    if (idx < 0 || idx >= count) continue
    points[idx].total++
    points[idx][a.outcome]++
  }
  return points
}

export function distribution(analyses: Analysis[]) {
  const counts: Record<Outcome, number> = { healthy: 0, disease: 0, inconclusive: 0 }
  for (const a of analyses) if (a.status !== 'processing') counts[a.outcome]++
  return (Object.keys(counts) as Outcome[]).map((k) => ({
    key: k,
    name: OUTCOME_META[k].label,
    value: counts[k],
    color: OUTCOME_META[k].color,
  }))
}

export function byCrop(analyses: Analysis[]) {
  const map = new Map<string, { crop: string; healthy: number; disease: number; inconclusive: number; total: number }>()
  for (const a of analyses) {
    if (a.status === 'processing') continue
    const row = map.get(a.cropName) ?? { crop: a.cropName, healthy: 0, disease: 0, inconclusive: 0, total: 0 }
    row[a.outcome]++
    row.total++
    map.set(a.cropName, row)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}
