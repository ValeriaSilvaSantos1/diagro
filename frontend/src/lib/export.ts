import type { Analysis, AnalysisStatus } from '@/types/domain'
import { formatDateTime, formatPercent } from './format'

export const STATUS_LABEL: Record<AnalysisStatus, string> = {
  done: 'Concluído',
  processing: 'Em processamento',
  inconclusive: 'Inconclusivo',
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export function analysisReportHtml(a: Analysis) {
  const rows: [string, string][] = [
    ['Identificador', a.id],
    ['Data da análise', formatDateTime(a.createdAt)],
    ['Cultura informada', a.cropName],
    ['Propriedade', a.property || '—'],
    ['Status', STATUS_LABEL[a.status]],
    ['Classificação retornada', a.classification],
    ['Nível de confiança informado', formatPercent(a.confidence)],
    ['Regiões de interesse', String(a.regions.length)],
    ['Observações do produtor', a.notes || '—'],
  ]
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório demonstrativo ${esc(a.id)} · DiAgro</title>
<style>body{font-family:Inter,system-ui,sans-serif;color:#0E2820;max-width:760px;margin:40px auto;padding:0 24px}h1{color:#0B3B2C;margin:0}
.demo{border:1px dashed #2E7D3A;background:#EEF5E9;padding:12px 16px;border-radius:10px;font-size:14px;margin:20px 0}
table{width:100%;border-collapse:collapse;margin-top:16px}td{border-bottom:1px solid #E2EFDA;padding:10px 4px;font-size:14px;vertical-align:top}td:first-child{color:#667470;width:40%}
img{width:100%;max-height:360px;object-fit:cover;border-radius:12px;margin-top:16px}small{color:#667470}</style></head><body>
<p><small>DiAgro · Relatório de análise</small></p><h1>Resultado da análise ${esc(a.id)}</h1>
<div class="demo"><strong>DOCUMENTO DEMONSTRATIVO.</strong> Este relatório foi gerado por um protótipo sem modelo de inteligência artificial conectado. A classificação é um exemplo fictício e não deve ser usada para decisões de manejo.</div>
<img src="${esc(a.image)}" alt="Imagem da folha analisada">
<table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
<p style="margin-top:24px;font-size:14px">A inteligência artificial é uma ferramenta de apoio e não substitui a avaliação de um profissional agrícola.</p>
<p><small>Gerado em ${esc(formatDateTime(new Date().toISOString()))}</small></p></body></html>`
}

export function analysesCsv(list: Analysis[], meta: string) {
  const header = ['Identificador', 'Data', 'Cultura', 'Classificação', 'Status', 'Confiança informada', 'Propriedade']
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = list.map((a) =>
    [a.id, formatDateTime(a.createdAt), a.cropName, a.classification, STATUS_LABEL[a.status], formatPercent(a.confidence), a.property ?? '']
      .map(q)
      .join(';'),
  )
  return ['﻿' + q('RELATÓRIO DEMONSTRATIVO — dados fictícios gerados pelo protótipo DiAgro'), q(meta), '', header.map(q).join(';'), ...lines].join('\n')
}
