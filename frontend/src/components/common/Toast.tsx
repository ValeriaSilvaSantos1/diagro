'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { cn } from '@/lib/format'

type Tone = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  title: string
  description?: string
  tone: Tone
}

type ToastFn = (t: { title: string; description?: string; tone?: Tone }) => void
const ToastContext = createContext<ToastFn>(() => {})

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info }
const TONES: Record<Tone, string> = {
  success: 'text-agro',
  error: 'text-danger',
  info: 'text-forest',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => setItems((s) => s.filter((t) => t.id !== id)), [])

  const toast = useCallback<ToastFn>(
    ({ title, description, tone = 'success' }) => {
      const id = Date.now() + Math.random()
      setItems((s) => [...s.slice(-2), { id, title, description, tone }])
      window.setTimeout(() => dismiss(id), 4800)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const Icon = ICONS[t.tone]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                role="status"
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-raised"
              >
                <Icon className={cn('mt-0.5 size-5 shrink-0', TONES[t.tone])} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="-m-1 rounded-md p-1 text-muted-foreground hover:bg-mist hover:text-ink"
                  aria-label="Fechar notificação"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
