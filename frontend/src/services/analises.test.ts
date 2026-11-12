import { describe, expect, it } from 'vitest'

import { type AnalysisApi, mapAnalysis } from '@/services/analises'

function analise(campos: Partial<AnalysisApi>): AnalysisApi {
  return {
    id: 1,
    imagem_id: 1,
    doenca_id: null,
    modelo_versao: 'efficientnet_b0-0fc7b17ac1b2',
    confianca: null,
    status: 'pendente',
    criado_em: '2026-11-12T20:00:00Z',
    arquivo_url: '/imagens/1',
    cultura: 'Arroz',
    nome_doenca: null,
    tratamento_recomendado: null,
    observacoes: null,
    ...campos,
  }
}

describe('mapAnalysis (F.1 a F.3, aprovados em 12/11)', () => {
  it('F.1 inconclusivo do backend abre a tela de inconclusivo', () => {
    const a = mapAnalysis(analise({ status: 'inconclusivo', confianca: 0.41 }))

    expect(a.status).toBe('inconclusive')
    expect(a.outcome).toBe('inconclusive')
  })

  it('F.2 concluído com doença abre a tela de resultado', () => {
    const a = mapAnalysis(analise({ status: 'concluido', doenca_id: 4, nome_doenca: 'Brusone', confianca: 0.93 }))

    expect(a.status).toBe('done')
    expect(a.outcome).toBe('disease')
  })

  it('F.3 processando fica em processamento', () => {
    expect(mapAnalysis(analise({ status: 'processando' })).status).toBe('processing')
  })
})
