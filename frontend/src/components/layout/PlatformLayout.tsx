'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { LoaderCircle, Menu as MenuIcon, Plus, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MAIN_NAV } from './nav'
import { consumeUserSignOut, useAppStore } from '@/store/AppStore'
import { useToast } from '@/components/common/Toast'
import { ApiError } from '@/services/api'
import { getCurrentUser, usuarioDaApi } from '@/services/auth'
import { cn } from '@/lib/format'

export function PlatformLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, storageWarning, updateUser, logout } = useAppStore()
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  // false até o backend confirmar que o token salvo ainda vale (GET /auth/me)
  const [sessionChecked, setSessionChecked] = useState(false)
  // O menu lateral (mobile) fica aberto só na rota em que foi aberto; ao navegar, fecha.
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const drawer = drawerPath === pathname
  const setDrawer = (open: boolean) => setDrawerPath(open ? pathname : null)

  // Confere o token com o backend e atualiza nome/e-mail com os dados do banco.
  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    getCurrentUser()
      .then((usuario) => {
        if (cancelled) return
        updateUser(usuarioDaApi(usuario))
        setSessionChecked(true)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          // Token vencido (vale 30 min) ou inválido: volta ao login.
          toast({ title: 'Sua sessão expirou', description: 'Entre novamente para continuar.', tone: 'info' })
          logout({ expired: true })
        } else {
          // Servidor fora do ar: os dados desta área ainda são locais, então a pessoa continua.
          setSessionChecked(true)
        }
      })
    return () => {
      cancelled = true
    }
    // Só quando o estado de login muda (updateUser/logout/toast mudam de referência a cada render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Sem login: vai para o login e, depois de entrar, volta para esta página.
  useEffect(() => {
    if (isAuthenticated) return
    if (consumeUserSignOut()) return // clicou em "Sair": já está indo para a página inicial
    router.replace(`/login?from=${encodeURIComponent(pathname)}`)
  }, [isAuthenticated, pathname, router])

  if (!isAuthenticated) return null
  if (!sessionChecked)
    return (
      <div className="grid min-h-screen place-items-center bg-mist text-muted-foreground" role="status">
        <span className="flex items-center gap-2 text-sm">
          <LoaderCircle className="size-5 animate-spin text-agro" aria-hidden /> Verificando sua sessão…
        </span>
      </div>
    )

  return (
    <div className="min-h-screen bg-mist">
      <a href="#conteudo" className="sr-only z-[100] rounded-lg bg-forest px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] lg:flex">
        <Sidebar />
      </aside>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] md:flex lg:hidden">
        <Sidebar variant="rail" />
      </aside>

      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div
              className="absolute inset-0 bg-forest-deep/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[min(300px,86vw)]"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
            >
              <Sidebar onNavigate={() => setDrawer(false)} />
              <button type="button" onClick={() => setDrawer(false)} className="absolute right-3 top-3.5 rounded-lg p-2 text-muted-foreground hover:bg-mist" aria-label="Fechar menu">
                <X className="size-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="md:pl-[76px] lg:pl-[264px]">
        <Topbar onMenu={() => setDrawer(true)} />
        {storageWarning && (
          <div className="border-b border-warn/30 bg-warn-soft px-6 py-2 text-center text-sm text-warn-ink" role="status">
            O armazenamento local do navegador está cheio. Novas imagens podem não ser salvas após recarregar a página.
          </div>
        )}
        <main id="conteudo" className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8 lg:pt-8">
          <div key={pathname} className="animate-fade-up">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav onMenu={() => setDrawer(true)} />
    </div>
  )
}

function MobileBottomNav({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname()
  const items = [MAIN_NAV[0], MAIN_NAV[2], MAIN_NAV[3]]
  const CropIcon = items[2].icon
  // The new-analysis screen shows its own fixed action bar instead.
  if (pathname.startsWith('/app/nova-analise')) return null
  const linkCls = (active: boolean) => cn('flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition', active ? 'text-agro' : 'text-muted-foreground')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Navegação rápida">
      <div className="mx-auto flex max-w-md items-end px-2">
        {items.slice(0, 2).map((n) => (
          <Link key={n.to} href={n.to} className={linkCls(n.match(pathname))} aria-current={n.match(pathname) ? 'page' : undefined}>
            <n.icon className="size-5" />
            {n.short}
          </Link>
        ))}
        <div className="flex flex-1 justify-center">
          <Link href="/app/nova-analise" className="-mt-5 flex flex-col items-center gap-1 text-[11px] font-semibold text-forest" aria-label="Nova análise">
            <span className="grid size-13 place-items-center rounded-2xl bg-agro text-white shadow-[0_10px_24px_-8px_rgba(46,125,58,0.8)] ring-4 ring-white">
              <Plus className="size-6" strokeWidth={2.4} />
            </span>
            Analisar
          </Link>
        </div>
        <Link href={items[2].to} className={linkCls(items[2].match(pathname))} aria-current={items[2].match(pathname) ? 'page' : undefined}>
          <CropIcon className="size-5" />
          {items[2].short}
        </Link>
        <button type="button" onClick={onMenu} className={linkCls(false)}>
          <MenuIcon className="size-5" />
          Menu
        </button>
      </div>
    </nav>
  )
}
