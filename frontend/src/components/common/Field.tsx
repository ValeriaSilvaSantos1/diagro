'use client'

import { useId, useState, type InputHTMLAttributes, type ReactNode, type Ref, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Check, ChevronDown, CircleAlert, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/format'

const control =
  'w-full rounded-lg border border-line-strong bg-white text-[15px] text-ink placeholder:text-muted-foreground/70 outline-none transition focus:border-agro focus:ring-4 focus:ring-agro/15 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15 disabled:bg-mist disabled:text-muted-foreground'

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
  className?: string
}

export function Field({ label, htmlFor, hint, error, optional, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">(opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="flex items-center gap-1.5 text-sm text-danger-ink" role="alert">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; ref?: Ref<HTMLInputElement>; leading?: ReactNode }

export function Input({ className, invalid, leading, ...rest }: InputProps) {
  if (leading)
    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">{leading}</span>
        <input aria-invalid={invalid || undefined} className={cn(control, 'h-11 pl-10 pr-3.5', className)} {...rest} />
      </div>
    )
  return <input aria-invalid={invalid || undefined} className={cn(control, 'h-11 px-3.5', className)} {...rest} />
}

export function PasswordInput({ className, invalid, ...rest }: InputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input type={visible ? 'text' : 'password'} aria-invalid={invalid || undefined} className={cn(control, 'h-11 pl-3.5 pr-12', className)} {...rest} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded-md text-muted-foreground transition hover:bg-mist hover:text-ink"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
      </button>
    </div>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }

export function Select({ className, invalid, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select aria-invalid={invalid || undefined} className={cn(control, 'h-11 appearance-none pl-3.5 pr-10', className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  )
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-24 resize-y px-3.5 py-2.5', className)} {...rest} />
}

export function Checkbox({
  checked,
  onChange,
  label,
  invalid,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  invalid?: boolean
  id?: string
}) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <label htmlFor={inputId} className="group flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={invalid || undefined}
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border border-line-strong bg-white transition checked:border-agro checked:bg-agro aria-[invalid=true]:border-danger focus-visible:ring-4 focus-visible:ring-agro/20"
        />
        <Check className="pointer-events-none relative size-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden />
      </span>
      <span className="leading-snug">{label}</span>
    </label>
  )
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        <p id={id} className="text-sm font-semibold text-ink">
          {label}
        </p>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-agro' : 'bg-line-strong')}
      >
        <span className={cn('inline-block size-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5.5' : 'translate-x-0.5')} />
      </button>
    </div>
  )
}
