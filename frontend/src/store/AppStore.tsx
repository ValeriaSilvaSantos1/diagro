'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { listarAnalises } from '@/services/analises'
import { listarCulturas } from '@/services/culturas'
import type { Analysis, AppNotification, Crop, Preferences, User } from '@/types/domain'

const DATA_KEY = 'diagro:data:v1'
const SESSION_KEY = 'diagro:session'
const TOKEN_KEY = 'diagro:token'

interface PersistedData {
  user: User
  analyses: Analysis[]
  crops: Crop[]
  notifications: AppNotification[]
  prefs: Preferences
}

const DEFAULT_PREFS: Preferences = {
  notifyAnalysis: true,
  notifyAttention: true,
  notifyTips: false,
  areaUnit: 'ha',
  compactTables: false,
  shareAnonymous: false,
}

function emptyData(): PersistedData {
  return { user: { name: '', email: '' }, crops: [], analyses: [], notifications: [], prefs: DEFAULT_PREFS }
}

function readSession() {
  try {
    return Boolean(
      (localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)) &&
        (localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)),
    )
  } catch {
    return false
  }
}

const uid = () => Math.random().toString(36).slice(2, 10)

// Marca que a sessão foi encerrada pelo próprio usuário (botão "Sair"), para a
// proteção da área interna não mandá-lo ao login enquanto ele vai para a página inicial.
let userSignedOut = false
export const consumeUserSignOut = () => {
  const value = userSignedOut
  userSignedOut = false
  return value
}

export type NewAnalysis = Omit<Analysis, 'id' | 'createdAt' | 'source'>

interface AppStoreValue extends PersistedData {
  isAuthenticated: boolean
  storageWarning: boolean
  login: (user: User, token: string, remember: boolean) => void
  signup: (user: User) => void
  /** Encerra a sessão. `expired: true` quando o token venceu (a pessoa volta ao login, não à página inicial). */
  logout: (options?: { expired?: boolean }) => void
  updateUser: (patch: Partial<User>) => void
  addAnalysis: (a: NewAnalysis) => Analysis
    appendAnalysis: (a: Analysis) => void
  updateAnalysis: (id: string, patch: Partial<Analysis>) => void
  deleteAnalysis: (id: string) => void
  addCrop: (c: Omit<Crop, 'id' | 'createdAt'>) => Crop
  updateCrop: (id: string, patch: Partial<Crop>) => void
  deleteCrop: (id: string) => void
  pushNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  setPrefs: (patch: Partial<Preferences>) => void
  resetDemo: () => void
  clearAllData: () => void
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

/**
 * Client-side session state. Domain data is loaded from the API after authentication.
 */
const noopSubscribe = () => () => {}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // false no servidor e durante a hidratação; true depois, no navegador.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const [data, setData] = useState<PersistedData | null>(() => (typeof window === 'undefined' ? null : emptyData()))
  const [isAuthenticated, setAuthenticated] = useState(() => (typeof window === 'undefined' ? false : readSession()))
  const [storageWarning, setStorageWarning] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    Promise.all([listarAnalises(), listarCulturas()])
      .then(([analyses, cultures]) => {
        setData((current) => current && {
          ...current,
          analyses,
          crops: cultures.map((culture) => ({ id: String(culture.id), name: culture.nome, image: '', createdAt: new Date().toISOString() })),
        })
      })
      .catch(() => {
        // A tela pode continuar vazia enquanto a API estiver indisponível.
      })
  }, [isAuthenticated])

  const update = useCallback((fn: (d: PersistedData) => PersistedData) => setData((d) => (d ? fn(d) : d)), [])

  const login = useCallback(
    (user: User, token: string, remember: boolean) => {
      const store = remember ? localStorage : sessionStorage
      store.setItem(SESSION_KEY, '1')
      store.setItem(TOKEN_KEY, token)
      update((d) => ({ ...d, user: { ...d.user, ...user } }))
      setAuthenticated(true)
    },
    [update],
  )

  const signup = useCallback(
    (user: User) => {
      localStorage.setItem(SESSION_KEY, '1')
      update((d) => ({ ...d, user: { ...d.user, ...user } }))
      setAuthenticated(true)
    },
    [update],
  )

  const logout = useCallback((options?: { expired?: boolean }) => {
    userSignedOut = !options?.expired
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setAuthenticated(false)
  }, [])

  const value = useMemo<AppStoreValue | null>(() => {
    if (!data) return null
    return {
      ...data,
      isAuthenticated,
      storageWarning,
      login,
      signup,
      logout,
      updateUser: (patch) => update((d) => ({ ...d, user: { ...d.user, ...patch } })),
      addAnalysis: (a) => {
        const max = data.analyses.reduce((m, x) => Math.max(m, Number(x.id.replace(/\D/g, '')) || 0), 0)
        const created: Analysis = {
          ...a,
          id: `AV-${String(max + 1).padStart(4, '0')}`,
          createdAt: new Date().toISOString(),
          source: 'upload',
        }
        update((d) => ({ ...d, analyses: [created, ...d.analyses] }))
        return created
      },
      appendAnalysis: (analysis) => update((d) => ({ ...d, analyses: [analysis, ...d.analyses] })),
      updateAnalysis: (id, patch) => update((d) => ({ ...d, analyses: d.analyses.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      deleteAnalysis: (id) => update((d) => ({ ...d, analyses: d.analyses.filter((a) => a.id !== id) })),
      addCrop: (c) => {
        const crop: Crop = { ...c, id: `crop-${uid()}`, createdAt: new Date().toISOString() }
        update((d) => ({ ...d, crops: [...d.crops, crop] }))
        return crop
      },
      updateCrop: (id, patch) => update((d) => ({ ...d, crops: d.crops.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCrop: (id) =>
        update((d) => ({
          ...d,
          crops: d.crops.filter((c) => c.id !== id),
          analyses: d.analyses.map((a) => (a.cropId === id ? { ...a, cropId: null } : a)),
        })),
      pushNotification: (n) =>
        update((d) => ({
          ...d,
          notifications: [{ ...n, id: uid(), createdAt: new Date().toISOString(), read: false }, ...d.notifications].slice(0, 20),
        })),
      markNotificationRead: (id) => update((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () => update((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })),
      setPrefs: (patch) => update((d) => ({ ...d, prefs: { ...d.prefs, ...patch } })),
      resetDemo: () => update((d) => ({ ...d, analyses: [], crops: [], notifications: [] })),
      clearAllData: () => update((d) => ({ ...d, analyses: [], crops: [], notifications: [] })),
    }
  }, [data, isAuthenticated, storageWarning, login, signup, logout, update])

  if (!isClient || !value) return null
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider')
  return ctx
}
