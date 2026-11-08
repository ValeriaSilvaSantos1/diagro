'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/format'

interface DropdownProps {
  label: string
  button: ReactNode
  buttonClassName?: string
  align?: 'left' | 'right'
  panelClassName?: string
  children: (close: () => void) => ReactNode
}

export function Dropdown({ label, button, buttonClassName, align = 'right', panelClassName, children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha ao sair da página (com cacheComponents ela é ocultada, não desmontada).
  useLayoutEffect(() => () => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className={buttonClassName}
      >
        {button}
      </button>
      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute top-full z-50 mt-2 min-w-52 origin-top animate-fade-in rounded-xl border border-line bg-white p-1.5 shadow-raised',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function MenuItem({ icon, children, onClick, danger }: { icon?: ReactNode; children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition',
        danger ? 'text-danger-ink hover:bg-danger-soft' : 'text-ink-soft hover:bg-mist hover:text-ink',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
