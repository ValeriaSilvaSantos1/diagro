import type { jsPDF } from 'jspdf'
import type { Analysis } from '@/types/domain'
import { buscarImagem } from '@/services/imagens'
import { STATUS_LABEL } from './export'
import { formatDateTime, formatPercent } from './format'

type RGB = [number, number, number]
const FOREST: RGB = [11, 59, 44]
const AGRO: RGB = [46, 125, 58]
const LIME: RGB = [190, 230, 120]
const MINT: RGB = [238, 245, 233]
const LINE: RGB = [226, 239, 218]
const INK: RGB = [14, 40, 32]
const MUTED: RGB = [102, 116, 112]
const WARN: RGB = [180, 83, 9]

const MARGEM = 16
const AVISO =
  'A classificação da inteligência artificial é uma ferramenta de apoio e não substitui a avaliação de um profissional agrícola.'

export function resultadoLabel(a: Analysis) {
  if (a.status === 'processing') return 'Em processamento'
  if (a.status === 'inconclusive') return 'Inconclusivo'
  return a.outcome === 'healthy' ? 'Folha sadia' : 'Doença ou praga identificada'
}

function tituloResultado(a: Analysis) {
  if (a.status === 'processing') return 'Análise em processamento'
  if (a.status === 'inconclusive') return 'Não foi possível identificar um resultado confiável'
  return a.outcome === 'healthy' ? 'Nenhum sinal de doença identificado' : 'Possíveis sinais de doença identificados'
}

function interpretacao(a: Analysis) {
  if (a.status === 'processing') return 'A imagem foi recebida e o resultado ainda está sendo processado.'
  if (a.status === 'inconclusive')
    return 'Tente uma nova fotografia: use uma imagem nítida, com luz natural e a câmera próxima da região afetada, com apenas uma folha no enquadramento. Se a dúvida persistir, procure orientação de um profissional agrícola.'
  return a.outcome === 'healthy'
    ? 'O modelo não encontrou, nesta imagem, sinais visuais associados às classificações conhecidas. Isso não garante que a planta esteja saudável: continue acompanhando a lavoura.'
    : 'Esta classificação foi gerada por um modelo de inteligência artificial e precisa ser interpretada considerando as condições da cultura e o contexto da plantação. Se os sinais persistirem ou se espalharem, procure orientação de um profissional agrícola.'
}

async function novoDocumento() {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  return { doc, autoTable }
}

const larguraPagina = (doc: jsPDF) => doc.internal.pageSize.getWidth()
const alturaPagina = (doc: jsPDF) => doc.internal.pageSize.getHeight()
const fimDaTabela = (doc: jsPDF) => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

function cabecalho(doc: jsPDF, subtitulo: string, direita: string) {
  const w = larguraPagina(doc)
  doc.setFillColor(...FOREST)
  doc.rect(0, 0, w, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('DiAgro', MARGEM, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...LIME)
  doc.text(subtitulo, MARGEM, 19.5)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text(direita, w - MARGEM, 13, { align: 'right' })
  doc.text(`Gerado em ${formatDateTime(new Date().toISOString())}`, w - MARGEM, 19.5, { align: 'right' })
}

function rodapes(doc: jsPDF) {
  const total = doc.getNumberOfPages()
  const w = larguraPagina(doc)
  const h = alturaPagina(doc)
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setDrawColor(...LINE)
    doc.line(MARGEM, h - 14, w - MARGEM, h - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('DiAgro · Detecção de doenças em plantas por imagem', MARGEM, h - 9)
    doc.text(`Página ${i} de ${total}`, w - MARGEM, h - 9, { align: 'right' })
  }
}

/** Garante espaço na página; se não houver, abre outra e devolve o novo y. */
function espaco(doc: jsPDF, y: number, precisa: number) {
  if (y + precisa <= alturaPagina(doc) - 20) return y
  doc.addPage()
  return 20
}

function tituloSecao(doc: jsPDF, texto: string, y: number) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...FOREST)
  doc.text(texto, MARGEM, y)
  return y + 5
}

function paragrafo(doc: jsPDF, texto: string, y: number, cor: RGB = INK) {
  const largura = larguraPagina(doc) - MARGEM * 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...cor)
  const linhas = doc.splitTextToSize(texto, largura) as string[]
  y = espaco(doc, y, linhas.length * 5)
  doc.text(linhas, MARGEM, y + 3.5)
  return y + linhas.length * 5 + 2
}

function caixaAviso(doc: jsPDF, texto: string, y: number) {
  const largura = larguraPagina(doc) - MARGEM * 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const linhas = doc.splitTextToSize(texto, largura - 10) as string[]
  const altura = linhas.length * 4.5 + 7
  y = espaco(doc, y, altura)
  doc.setFillColor(...MINT)
  doc.setDrawColor(...AGRO)
  doc.roundedRect(MARGEM, y, largura, altura, 2, 2, 'FD')
  doc.setTextColor(...FOREST)
  doc.text(linhas, MARGEM + 5, y + 6)
  return y + altura + 6
}

/** Foto da análise como JPEG para o PDF (a da API vem com o token do login). */
async function fotoParaPdf(src: string): Promise<{ data: string; w: number; h: number } | null> {
  let url: string | null = null
  try {
    url = await buscarImagem(src)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('foto não carregou'))
      img.src = url!
    })
    const escala = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * escala)
    canvas.height = Math.round(img.naturalHeight * escala)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return { data: canvas.toDataURL('image/jpeg', 0.85), w: canvas.width, h: canvas.height }
  } catch {
    return null
  } finally {
    if (url && url !== src && url.startsWith('blob:')) URL.revokeObjectURL(url)
  }
}

export async function relatorioAnalisePdf(a: Analysis): Promise<Blob> {
  const { doc, autoTable } = await novoDocumento()
  const w = larguraPagina(doc)
  const largura = w - MARGEM * 2
  cabecalho(doc, 'Relatório de análise', `Registro nº ${a.id}`)

  // Resultado em destaque
  let y = 38
  const doenca = a.status === 'done' && a.outcome === 'disease'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...(doenca ? WARN : FOREST))
  const titulo = doc.splitTextToSize(tituloResultado(a), largura) as string[]
  doc.text(titulo, MARGEM, y)
  y += titulo.length * 6.5

  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text(a.classification, MARGEM, y + 1)
  if (a.confidence != null) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(...FOREST)
    doc.text(formatPercent(a.confidence), w - MARGEM, y - 4, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('confiança do modelo', w - MARGEM, y + 1, { align: 'right' })

    // Barra de confiança
    y += 5
    doc.setFillColor(...LINE)
    doc.roundedRect(MARGEM, y, largura, 2.5, 1.2, 1.2, 'F')
    doc.setFillColor(...AGRO)
    doc.roundedRect(MARGEM, y, Math.max(2.5, largura * a.confidence), 2.5, 1.2, 1.2, 'F')
    y += 9
  } else {
    y += 8
  }

  // Foto
  const foto = await fotoParaPdf(a.image)
  if (foto) {
    const maxW = largura
    const maxH = 95
    const escala = Math.min(maxW / foto.w, maxH / foto.h)
    const fw = foto.w * escala
    const fh = foto.h * escala
    doc.addImage(foto.data, 'JPEG', MARGEM + (largura - fw) / 2, y, fw, fh)
    y += fh + 3
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(`Folha de ${a.cropName} enviada para análise`, w / 2, y + 2, { align: 'center' })
    y += 8
  }

  // Dados
  y = tituloSecao(doc, 'Dados da análise', espaco(doc, y, 30))
  const linhas: [string, string][] = [
    ['Registro', a.id],
    ['Data da análise', formatDateTime(a.createdAt)],
    ['Cultura', a.cropName],
    ['Propriedade', a.property || 'Não informada'],
    ['Status', STATUS_LABEL[a.status]],
    ['Resultado', resultadoLabel(a)],
    ['Classificação', a.classification],
    ['Confiança do modelo', formatPercent(a.confidence)],
    ['Versão do modelo', a.modelVersion || 'Não informada'],
    ['Observações', a.notes || 'Nenhuma observação'],
  ]
  autoTable(doc, {
    startY: y,
    margin: { left: MARGEM, right: MARGEM, bottom: 20 },
    body: linhas,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 }, textColor: INK, lineColor: LINE, lineWidth: { bottom: 0.2 } },
    columnStyles: { 0: { cellWidth: 52, textColor: MUTED }, 1: { fontStyle: 'bold' } },
    alternateRowStyles: { fillColor: [249, 251, 247] },
  })
  y = fimDaTabela(doc) + 8

  if (a.treatment) {
    y = tituloSecao(doc, 'Tratamento recomendado', espaco(doc, y, 20))
    y = paragrafo(doc, a.treatment, y) + 4
  }

  y = tituloSecao(doc, 'Em linguagem simples', espaco(doc, y, 20))
  y = paragrafo(doc, interpretacao(a), y) + 4
  caixaAviso(doc, AVISO, y)

  rodapes(doc)
  return doc.output('blob')
}

export interface FiltrosRelatorio {
  periodo: string
  cultura: string
}

export async function relatorioPeriodoPdf(lista: Analysis[], filtros: FiltrosRelatorio): Promise<Blob> {
  const { doc, autoTable } = await novoDocumento()
  const w = larguraPagina(doc)
  const largura = w - MARGEM * 2
  cabecalho(doc, 'Relatório de análises', `${lista.length} ${lista.length === 1 ? 'análise' : 'análises'}`)

  let y = 38
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...FOREST)
  doc.text('Resumo das análises', MARGEM, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text(`Período: ${filtros.periodo}   ·   Cultura: ${filtros.cultura}`, MARGEM, y)
  y += 8

  // Indicadores
  const conta = (f: (a: Analysis) => boolean) => lista.filter(f).length
  const concluidas = lista.filter((a) => a.status === 'done')
  const confiancas = concluidas.map((a) => a.confidence).filter((c): c is number => c != null)
  const media = confiancas.length ? confiancas.reduce((s, c) => s + c, 0) / confiancas.length : null
  const cards: [string, string][] = [
    ['Total', String(lista.length)],
    ['Com doença ou praga', String(conta((a) => a.status === 'done' && a.outcome === 'disease'))],
    ['Folhas sadias', String(conta((a) => a.status === 'done' && a.outcome === 'healthy'))],
    ['Inconclusivas', String(conta((a) => a.status === 'inconclusive'))],
    ['Confiança média', formatPercent(media)],
  ]
  const gap = 3
  const cw = (largura - gap * (cards.length - 1)) / cards.length
  cards.forEach(([rotulo, valor], i) => {
    const x = MARGEM + i * (cw + gap)
    doc.setFillColor(...MINT)
    doc.roundedRect(x, y, cw, 20, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...FOREST)
    doc.text(valor, x + 4, y + 9)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text(doc.splitTextToSize(rotulo, cw - 8) as string[], x + 4, y + 14.5)
  })
  y += 28

  // Classificações mais frequentes
  const porClasse = new Map<string, number>()
  for (const a of concluidas) porClasse.set(a.classification, (porClasse.get(a.classification) ?? 0) + 1)
  if (porClasse.size) {
    y = tituloSecao(doc, 'Classificações mais frequentes', y)
    autoTable(doc, {
      startY: y,
      margin: { left: MARGEM, right: MARGEM, bottom: 20 },
      head: [['Classificação', 'Análises', '% das concluídas']],
      body: [...porClasse.entries()]
        .sort((x, z) => z[1] - x[1])
        .map(([nome, n]) => [nome, String(n), formatPercent(n / concluidas.length)]),
      theme: 'grid',
      headStyles: { fillColor: FOREST, textColor: 255, fontStyle: 'bold' },
      styles: { font: 'helvetica', fontSize: 9.5, textColor: INK, lineColor: LINE, lineWidth: 0.2 },
      columnStyles: { 1: { halign: 'right', cellWidth: 28 }, 2: { halign: 'right', cellWidth: 36 } },
    })
    y = fimDaTabela(doc) + 9
  }

  // Lista completa
  y = tituloSecao(doc, 'Análises do período', espaco(doc, y, 25))
  const ordenadas = [...lista].sort((x, z) => z.createdAt.localeCompare(x.createdAt))
  autoTable(doc, {
    startY: y,
    margin: { left: MARGEM, right: MARGEM, bottom: 20, top: 20 },
    head: [['Registro', 'Data', 'Cultura', 'Classificação', 'Status', 'Confiança']],
    body: ordenadas.map((a) => [a.id, formatDateTime(a.createdAt), a.cropName, a.classification, STATUS_LABEL[a.status], formatPercent(a.confidence)]),
    theme: 'striped',
    headStyles: { fillColor: FOREST, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 249, 242] },
    styles: { font: 'helvetica', fontSize: 8.5, textColor: INK, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 32 }, 5: { halign: 'right', cellWidth: 22 } },
  })
  y = fimDaTabela(doc) + 8

  caixaAviso(doc, AVISO, y)
  rodapes(doc)
  return doc.output('blob')
}
