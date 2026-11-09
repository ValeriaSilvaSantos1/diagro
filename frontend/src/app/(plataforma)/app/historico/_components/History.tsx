'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CloudOff, FlaskConical, Inbox, Plus, RotateCcw, Search, SearchX } from 'lucide-react'
import { Button, ButtonLink } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { DemoBadge } from '@/components/common/Badge'
import { Field, Input, Select } from '@/components/common/Field'
import { EmptyState, PageHeader, Skeleton } from '@/components/common/Misc'
import { Dropdown, MenuItem } from '@/components/common/Dropdown'
import { ConfirmDialog } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { useToast } from '@/components/common/Toast'
import { AnalysisList } from '@/components/analysis/AnalysisList'
import { useAppStore } from '@/store/AppStore'
import type { Analysis } from '@/types/domain'
import { normalize } from '@/lib/format'

const PER_PAGE = 10
const DAY = 86_400_000
type ViewState = 'ready' | 'loading' | 'error' | 'empty'
type Period = 'all' | '7' | '30' | '90' | 'custom'

export default function History() {
  const { analyses, deleteAnalysis, prefs } = useAppStore()
  const toast = useToast()
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const paramQuery = params.get('q') ?? params.get('cultura')
  const [query, setQuery] = useState(paramQuery ?? '')
  // Busca vinda da URL (ex.: "Ver no histórico" no catálogo) substitui a busca atual.
  const [lastParamQuery, setLastParamQuery] = useState(paramQuery)
  if (paramQuery !== lastParamQuery) {
    setLastParamQuery(paramQuery)
    if (paramQuery !== null) setQuery(paramQuery)
  }
  const [period, setPeriod] = useState<Period>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const [order, setOrder] = useState<'desc' | 'asc'>('desc')
  const [view, setView] = useState<ViewState>('loading')
  const [toDelete, setToDelete] = useState<Analysis | null>(null)
  // Referência para os períodos "últimos N dias" (fixada ao abrir a tela).
  const [now] = useState(() => Date.now())

  // Simulated latency to demonstrate the loading state.
  useEffect(() => {
    if (view !== 'loading') return
    const t = window.setTimeout(() => setView('ready'), 600)
    return () => window.clearTimeout(t)
  }, [view])

  const filtered = useMemo(() => {
    const q = normalize(query)
    let fromTs = -Infinity
    let toTs = Infinity
    if (period === 'custom') {
      if (from) fromTs = new Date(`${from}T00:00:00`).getTime()
      if (to) toTs = new Date(`${to}T23:59:59`).getTime()
    } else if (period !== 'all') fromTs = now - Number(period) * DAY

    const list = analyses.filter((a) => {
      const t = new Date(a.createdAt).getTime()
      if (status && a.status !== status) return false
      if (t < fromTs || t > toTs) return false
      if (q && !normalize(`${a.cropName} ${a.classification} ${a.id}`).includes(q)) return false
      return true
    })
    return list.sort((x, y) => (order === 'desc' ? y.createdAt.localeCompare(x.createdAt) : x.createdAt.localeCompare(y.createdAt)))
  }, [analyses, status, period, from, to, query, order, now])

  // Volta para a página 1 sempre que filtros ou ordenação mudam.
  const filtersKey = [status, period, from, to, query, order].join('|')
  const [pageState, setPageState] = useState({ key: filtersKey, page: 1 })
  const page = pageState.key === filtersKey ? pageState.page : 1
  const setPage = (p: number) => setPageState({ key: filtersKey, page: p })

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const hasFilters = Boolean(status || period !== 'all' || query)

  const clear = () => {
    setStatus('')
    setPeriod('all')
    setFrom('')
    setTo('')
    setQuery('')
    router.replace(pathname)
  }

  const isEmpty = view === 'empty' || analyses.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<DemoBadge label="Exemplos demonstrativos" />}
        title="Histórico de análises"
        subtitle="Consulte as análises realizadas nas suas culturas."
        actions={
          <ButtonLink href="/app/nova-analise" icon={<Plus className="size-4" />}>
            Nova análise
          </ButtonLink>
        }
      />

      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Field label="Buscar" htmlFor="f-query">
            <Input id="f-query" leading={<Search className="size-4" />} placeholder="Cultura ou classificação" value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field>
          <Field label="Período" htmlFor="f-period">
            <Select id="f-period" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
              <option value="all">Todo o período</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="custom">Personalizado</option>
            </Select>
          </Field>
          <Field label="Status" htmlFor="f-status">
            <Select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="done">Concluído</option>
              <option value="processing">Em processamento</option>
              <option value="inconclusive">Inconclusivo</option>
            </Select>
          </Field>
        </div>
        {period === 'custom' && (
          <div className="mt-4 grid animate-fade-in gap-4 sm:grid-cols-2 md:max-w-md">
            <Field label="De" htmlFor="f-from">
              <Input id="f-from" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="Até" htmlFor="f-to">
              <Input id="f-to" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {view === 'ready' && !isEmpty && (
              <>
                <strong className="font-semibold text-ink">{filtered.length}</strong> {filtered.length === 1 ? 'análise encontrada' : 'análises encontradas'}
              </>
            )}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={<RotateCcw className="size-4" />} onClick={clear} disabled={!hasFilters}>
              Limpar filtros
            </Button>
            <Dropdown
              label="Simular estados da interface"
              buttonClassName="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-mist hover:text-ink"
              button={
                <>
                  <FlaskConical className="size-4" /> <span className="hidden sm:inline">Estados</span>
                </>
              }
            >
              {(close) => (
                <>
                  <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Demonstração</p>
                  <MenuItem onClick={() => (close(), setView('loading'))}>Simular carregamento</MenuItem>
                  <MenuItem onClick={() => (close(), setView('error'))}>Simular erro</MenuItem>
                  <MenuItem onClick={() => (close(), setView('empty'))}>Simular conta sem análises</MenuItem>
                  <MenuItem onClick={() => (close(), setView('ready'))}>Voltar ao normal</MenuItem>
                </>
              )}
            </Dropdown>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {view === 'loading' ? (
          <div className="divide-y divide-line" aria-busy="true" aria-label="Carregando análises">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-1/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="hidden h-6 w-24 rounded-full sm:block" />
              </div>
            ))}
          </div>
        ) : view === 'error' ? (
          <EmptyState
            icon={<CloudOff className="size-7" />}
            title="Não foi possível carregar o histórico"
            description="Verifique sua conexão e tente novamente. (Estado simulado para demonstração.)"
            action={
              <Button onClick={() => setView('loading')} icon={<RotateCcw className="size-4" />}>
                Tentar novamente
              </Button>
            }
          />
        ) : isEmpty ? (
          <EmptyState
            icon={<Inbox className="size-7" />}
            title="Você ainda não realizou análises"
            description="Quando você enviar a foto de uma folha, o resultado aparecerá aqui."
            action={
              <>
                <ButtonLink href="/app/nova-analise">Realizar primeira análise</ButtonLink>
                {view === 'empty' && (
                  <Button variant="outline" onClick={() => setView('ready')}>
                    Sair da simulação
                  </Button>
                )}
              </>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-7" />}
            title="Nenhuma análise encontrada"
            description="Nenhum registro corresponde à busca ou aos filtros. Tente ajustar ou limpar os filtros."
            action={
              <Button variant="outline" onClick={clear} icon={<RotateCcw className="size-4" />}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <>
            <AnalysisList
              analyses={current}
              compact={prefs.compactTables}
              onDelete={setToDelete}
              sort={{ dir: order, onToggle: () => setOrder((o) => (o === 'desc' ? 'asc' : 'desc')) }}
            />
            <Pagination
              page={page}
              pages={pages}
              total={filtered.length}
              perPage={PER_PAGE}
              onChange={(p) => {
                setPage(p)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir esta análise?"
        description={`O registro ${toDelete?.id ?? ''} será removido do histórico. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir análise"
        onConfirm={() => {
          if (!toDelete) return
          deleteAnalysis(toDelete.id)
          toast({ title: 'Análise excluída', description: `${toDelete.id} foi removida do histórico.`, tone: 'info' })
        }}
      />
    </div>
  )
}
