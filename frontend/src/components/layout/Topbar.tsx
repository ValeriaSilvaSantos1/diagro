'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown, ChevronLeft, LogOut, Menu, Settings, User } from 'lucide-react'
import { Dropdown, MenuItem } from '@/components/common/Dropdown'
import { useAppStore } from '@/store/AppStore'
import { useToast } from '@/components/common/Toast'
import { catalogById } from '@/lib/demo/catalog'
import { cn, formatRelative, initials } from '@/lib/format'

const SECTIONS: Record<string, { label: string; to: string }> = {
  'nova-analise': { label: 'Nova análise', to: '/app/nova-analise' },
  historico: { label: 'Histórico', to: '/app/historico' },
  analises: { label: 'Histórico', to: '/app/historico' },
  culturas: { label: 'Minhas culturas', to: '/app/culturas' },
  catalogo: { label: 'Catálogo de doenças', to: '/app/catalogo' },
  relatorios: { label: 'Relatórios', to: '/app/relatorios' },
  perfil: { label: 'Meu perfil', to: '/app/perfil' },
  configuracoes: { label: 'Configurações', to: '/app/configuracoes' },
}

/** Current page name, plus its parent section on detail pages. */
function usePageTitle() {
  const pathname = usePathname()
  const { crops } = useAppStore()
  return useMemo(() => {
    const [section, rawId] = pathname.replace(/^\/app\/?/, '').split('/').filter(Boolean)
    if (!section) return { title: 'Visão geral' }
    const base = SECTIONS[section]
    if (!base) return { title: 'Página não encontrada' }
    if (!rawId) return { title: base.label }
    const id = decodeURIComponent(rawId)
    let title = id
    if (section === 'analises') title = `Análise ${id}`
    if (section === 'culturas') title = crops.find((c) => c.id === id)?.name ?? 'Cultura'
    if (section === 'catalogo') title = catalogById(id)?.name ?? 'Classificação'
    return { title, parent: base }
  }, [pathname, crops])
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { title, parent } = usePageTitle()
  const router = useRouter()
  const toast = useToast()
  const { user, notifications, markAllNotificationsRead, markNotificationRead, logout } = useAppStore()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenu} className="-ml-1 rounded-lg p-2 text-ink-soft hover:bg-mist md:hidden" aria-label="Abrir menu de navegação">
          <Menu className="size-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {parent && (
            <Link href={parent.to} className="flex shrink-0 items-center gap-1 rounded-md text-sm text-muted-foreground transition hover:text-ink" aria-label={`Voltar para ${parent.label}`}>
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">{parent.label}</span>
              <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
                /
              </span>
            </Link>
          )}
          <p className="truncate font-display text-[17px] font-bold text-ink" aria-current="page">
            {title}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Dropdown
            label={`Notificações${unread ? `, ${unread} não lidas` : ''}`}
            buttonClassName="relative rounded-lg p-2.5 text-ink-soft transition hover:bg-mist"
            panelClassName="w-[min(22rem,calc(100vw-2rem))] p-0 max-sm:-right-12"
            button={
              <>
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-white">
                    {unread}
                  </span>
                )}
              </>
            }
          >
            {(close) => (
              <div>
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="text-sm font-bold text-ink">Notificações</p>
                  {unread > 0 && (
                    <button type="button" onClick={markAllNotificationsRead} className="text-xs font-semibold text-agro hover:underline">
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">Você não tem notificações.</p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto p-1.5">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id)
                            if (n.href) router.push(n.href)
                            close()
                          }}
                          className="flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-mist"
                        >
                          <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-agro')} aria-hidden />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-ink">{n.title}</span>
                            <span className="block text-sm text-muted-foreground">{n.description}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground/80">{formatRelative(n.createdAt)}</span>
                          </span>
                          {!n.read && <span className="sr-only">(não lida)</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Dropdown>

          <Dropdown
            label="Menu do usuário"
            buttonClassName="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2 transition hover:bg-mist"
            button={
              <>
                <span className="grid size-8 place-items-center rounded-full bg-forest text-xs font-bold text-lime">{initials(user.name)}</span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-36 truncate text-sm font-semibold leading-tight text-ink">{user.name}</span>
                  <span className="block max-w-36 truncate text-[11px] leading-tight text-muted-foreground">{user.email}</span>
                </span>
                <ChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
              </>
            }
          >
            {(close) => (
              <>
                <div className="border-b border-line px-3 pb-2.5 pt-1.5">
                  <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="pt-1.5">
                  <MenuItem
                    icon={<User className="size-4" />}
                    onClick={() => {
                      close()
                      router.push('/app/perfil')
                    }}
                  >
                    Meu perfil
                  </MenuItem>
                  <MenuItem
                    icon={<Settings className="size-4" />}
                    onClick={() => {
                      close()
                      router.push('/app/configuracoes')
                    }}
                  >
                    Configurações
                  </MenuItem>
                  <MenuItem
                    danger
                    icon={<LogOut className="size-4" />}
                    onClick={() => {
                      close()
                      logout()
                      toast({ title: 'Sessão encerrada', tone: 'info' })
                      router.push('/')
                    }}
                  >
                    Sair
                  </MenuItem>
                </div>
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
