const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const formatDate = (iso: string) => dateFmt.format(new Date(iso)).replace(/ de /g, ' ').replace('.', '')
export const formatShortDate = (iso: string | Date) => shortFmt.format(new Date(iso)).replace(/ de /g, ' ').replace('.', '')
export const formatTime = (iso: string) => timeFmt.format(new Date(iso))
export const formatDateTime = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)}`

export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  if (d === 1) return 'ontem'
  if (d < 30) return `há ${d} dias`
  return formatDate(iso)
}

export const formatPercent = (v: number | null | undefined) => (v == null ? '—' : `${Math.round(v * 100)}%`)

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
