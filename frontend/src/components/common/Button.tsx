import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/format'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerGhost' | 'dangerOutline' | 'dark' | 'lime' | 'light'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-agro text-white hover:bg-agro-dark shadow-cta',
  secondary: 'bg-mint text-forest hover:bg-mint-strong',
  outline: 'border border-line-strong bg-white text-ink hover:border-agro/50 hover:bg-mist',
  ghost: 'text-ink-soft hover:bg-mist hover:text-ink',
  danger: 'bg-danger text-white hover:bg-[#c4443f]',
  dangerGhost: 'text-danger-ink hover:bg-danger-soft',
  dangerOutline: 'border border-danger/40 bg-white text-danger-ink hover:border-danger hover:bg-danger-soft',
  dark: 'bg-forest text-white hover:bg-forest-deep',
  lime: 'bg-lime text-forest hover:bg-lime/85',
  light: 'border border-white/25 bg-white/10 text-white hover:bg-white/20',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-6 text-[15px] gap-2',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-all duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
}

export function Button({ variant, size, loading, icon, className, children, type = 'button', disabled, ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  className?: string
}

export function ButtonLink({ variant, size, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
