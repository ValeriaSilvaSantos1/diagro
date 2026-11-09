import { BookOpen, ChartColumn, History, LayoutDashboard, ScanSearch, Settings, Sprout, User, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  short: string
  icon: LucideIcon
  match: (path: string) => boolean
}

export const MAIN_NAV: NavItem[] = [
  { to: '/app', label: 'Visão geral', short: 'Início', icon: LayoutDashboard, match: (p) => p === '/app' || p === '/app/' },
  { to: '/app/nova-analise', label: 'Nova análise', short: 'Analisar', icon: ScanSearch, match: (p) => p.startsWith('/app/nova-analise') },
  { to: '/app/historico', label: 'Histórico', short: 'Histórico', icon: History, match: (p) => p.startsWith('/app/historico') || p.startsWith('/app/analises') },
  { to: '/app/culturas', label: 'Minhas culturas', short: 'Culturas', icon: Sprout, match: (p) => p.startsWith('/app/culturas') },
  { to: '/app/catalogo', label: 'Catálogo de doenças', short: 'Catálogo', icon: BookOpen, match: (p) => p.startsWith('/app/catalogo') },
  { to: '/app/relatorios', label: 'Relatórios', short: 'Relatórios', icon: ChartColumn, match: (p) => p.startsWith('/app/relatorios') },
  { to: '/app/perfil', label: 'Meu perfil', short: 'Perfil', icon: User, match: (p) => p.startsWith('/app/perfil') },
]

export const SETTINGS_NAV: NavItem = {
  to: '/app/configuracoes',
  label: 'Configurações',
  short: 'Ajustes',
  icon: Settings,
  match: (p) => p.startsWith('/app/configuracoes'),
}
