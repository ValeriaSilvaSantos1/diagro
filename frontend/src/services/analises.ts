import { env } from '@/lib/env'
import { api } from '@/services/api'
import type { Analysis } from '@/types/domain'

export interface AnalysisApi {
  id: number
  imagem_id: number
  doenca_id: number | null
  modelo_versao: string
  confianca: number | null
  status: 'pendente' | 'processando' | 'concluido' | 'inconclusivo' | 'erro'
  criado_em: string
  arquivo_url: string
  cultura: string | null
  nome_doenca: string | null
  tratamento_recomendado: string | null
  observacoes: string | null
}

function mapAnalysis(item: AnalysisApi): Analysis {
  const image = item.arquivo_url.startsWith('http') ? item.arquivo_url : `${env.apiUrl}${item.arquivo_url}`
  const outcome = item.status === 'concluido' ? 'disease' : item.status === 'inconclusivo' ? 'inconclusive' : 'inconclusive'
  return {
    id: String(item.id),
    createdAt: item.criado_em,
    cropId: null,
    cropName: item.cultura ?? 'Não informado',
    image,
    outcome,
    status: item.status === 'pendente' || item.status === 'processando' ? 'processing' : item.status === 'erro' ? 'inconclusive' : 'done',
    classification: item.nome_doenca ?? (item.status === 'pendente' || item.status === 'processando' ? 'Aguardando resultado' : 'Resultado inconclusivo'),
    catalogId: item.doenca_id === null ? null : String(item.doenca_id),
    confidence: item.confianca,
    notes: item.observacoes ?? undefined,
    regions: [],
    source: 'upload',
  }
}

export async function listarAnalises() {
  const result = await api<AnalysisApi[]>('/analises')
  return result.map(mapAnalysis)
}

export async function criarAnalise(file: File, observacoes?: string) {
  const body = new FormData()
  body.append('arquivo', file)
  if (observacoes) body.append('observacoes', observacoes)
  const result = await api<AnalysisApi>('/analises', { method: 'POST', body })
  return mapAnalysis(result)
}

export async function obterAnalise(id: string) {
  return mapAnalysis(await api<AnalysisApi>(`/analises/${id}`))
}
