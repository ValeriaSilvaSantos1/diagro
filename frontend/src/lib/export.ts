import type { Analysis, AnalysisStatus } from '@/types/domain'
import { formatDateTime, formatPercent } from './format'

export const STATUS_LABEL: Record<AnalysisStatus, string> = {
  done: 'Concluído',
  processing: 'Em processamento',
  inconclusive: 'Inconclusivo',
}

export function downloadFile(filename: string, content: string | Blob, mime?: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function analysesCsv(list: Analysis[], meta: string) {
  const header = ['Identificador', 'Data', 'Cultura', 'Classificação', 'Status', 'Confiança do modelo', 'Propriedade']
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = list.map((a) =>
    [a.id, formatDateTime(a.createdAt), a.cropName, a.classification, STATUS_LABEL[a.status], formatPercent(a.confidence), a.property ?? '']
      .map(q)
      .join(';'),
  )
  return ['﻿' + q('Relatório de análises DiAgro'), q(meta), '', header.map(q).join(';'), ...lines].join('\n')
}
