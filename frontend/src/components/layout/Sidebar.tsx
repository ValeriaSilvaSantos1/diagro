'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Logo, LogoMark } from '@/components/layout/BrandLogo'
import { MAIN_NAV, SETTINGS_NAV, type NavItem } from './nav'
import { useAppStore } from '@/store/AppStore'
import { useToast } from '@/components/common/Toast'
import { cn } from '@/lib/format'

interface Props {
  variant?: 'full' | 'rail'
  onNavigate?: () => void
}

export function Sidebar({ variant = 'full', onNavigate }: Props) {
  const pathname = usePathname()
  const { logout } = useAppStore()
  const toast = useToast()
  const router = useRouter()
  const rail = variant === 'rail'

  const itemCls = (active: boolean) =>
    cn(
      'group relative flex items-center gap-3 rounded-lg text-sm font-medium transition',
      rail ? 'mx-auto size-11 justify-center' : 'px-3 py-2.5',
      active ? 'bg-mint font-semibold text-forest' : 'text-ink-soft hover:bg-mist hover:text-ink',
    )

  const item = (n: NavItem) => {
    const active = n.match(pathname)
    const Icon = n.icon
    return (
      <li key={n.to}>
        <Link
          href={n.to}
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          title={rail ? n.label : undefined}
          aria-label={rail ? n.label : undefined}
          className={itemCls(active)}
        >
          {active && <span className={cn('absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-agro', rail ? '-left-3' : '-left-4')} aria-hidden />}
          <Icon className={cn('size-[19px] shrink-0', active ? 'text-agro' : 'text-muted-foreground group-hover:text-ink-soft')} strokeWidth={active ? 2.2 : 1.9} />
          {!rail && <span className="truncate">{n.label}</span>}
        </Link>
      </li>
    )
  }

  const handleLogout = () => {
    logout()
    toast({ title: 'Sessão encerrada', description: 'Você foi desconectado com sucesso.', tone: 'info' })
    router.push('/')
  }

  return (
    <div className="flex h-full w-full flex-col border-r border-line bg-white">
      <div className={cn('flex h-16 shrink-0 items-center', rail ? 'justify-center' : 'px-5')}>
        {rail ? (
          <Link href="/app" aria-label="DiAgro — visão geral">
            <LogoMark className="size-9" />
          </Link>
        ) : (
          <Logo href="/app" />
        )}
      </div>

      <nav className={cn('flex-1 overflow-y-auto py-4', rail ? 'px-3' : 'px-4')} aria-label="Navegação da plataforma">
        <ul className="space-y-1">{MAIN_NAV.map(item)}</ul>
      </nav>

      <div className={cn('shrink-0 border-t border-line py-4', rail ? 'px-3' : 'px-4')}>
        <ul className="space-y-1">
          {item(SETTINGS_NAV)}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              title={rail ? 'Sair' : undefined}
              aria-label={rail ? 'Sair' : undefined}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg text-sm font-medium text-ink-soft transition hover:bg-danger-soft hover:text-danger-ink',
                rail ? 'mx-auto size-11 justify-center' : 'px-3 py-2.5',
              )}
            >
              <LogOut className="size-[19px] shrink-0 text-muted-foreground group-hover:text-danger-ink" strokeWidth={1.9} />
              {!rail && 'Sair'}
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
