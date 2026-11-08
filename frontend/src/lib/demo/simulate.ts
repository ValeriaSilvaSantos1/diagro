import { CATALOG } from '@/lib/demo/catalog'
import { randomRegions } from '@/lib/demo/seed'
import type { Analysis, Outcome } from '@/types/domain'

export type Scenario = 'auto' | Outcome

/**
 * Produces a fictitious result for the prototype. There is no AI model
 * connected — every value returned here is a labelled demonstration.
 * Replace this module with the real API call when the backend is ready.
 */
export function simulateResult(
  scenario: Scenario,
  cropName: string,
): Pick<Analysis, 'outcome' | 'status' | 'classification' | 'catalogId' | 'confidence' | 'regions'> {
  let outcome: Outcome
  if (scenario === 'auto') {
    const r = Math.random()
    outcome = r < 0.6 ? 'disease' : r < 0.85 ? 'healthy' : 'inconclusive'
  } else outcome = scenario

  if (outcome === 'disease') {
    const options = CATALOG.filter((c) => c.crops.includes(cropName))
    const entry = options.length ? options[Math.floor(Math.random() * options.length)] : null
    return {
      outcome,
      status: 'done',
      classification: entry ? `${entry.name} (exemplo)` : 'Mancha foliar (exemplo)',
      catalogId: entry?.id ?? null,
      confidence: 0.72 + Math.random() * 0.2,
      regions: randomRegions(Math.random, 2 + Math.floor(Math.random() * 2)),
    }
  }
  if (outcome === 'healthy')
    return { outcome, status: 'done', classification: 'Sem sinais identificados', catalogId: null, confidence: 0.82 + Math.random() * 0.14, regions: [] }
  return { outcome, status: 'inconclusive', classification: 'Resultado inconclusivo', catalogId: null, confidence: 0.3 + Math.random() * 0.2, regions: [] }
}
