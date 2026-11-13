import Link from 'next/link'
import { cn } from '@/lib/format'
import logo from "../../../public/images/landing/logo_Diagro.svg";
import Image from "next/image";

/** Leaf shaped like an eye with a lens at its center, framed by scan brackets. */
export function LogoMark({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill={inverted ? '#EEF5E9' : '#0B3B2C'} />
      <path
        d="M9 14v-3a2 2 0 0 1 2-2h3M26 9h3a2 2 0 0 1 2 2v3M31 26v3a2 2 0 0 1-2 2h-3M14 31h-3a2 2 0 0 1-2-2v-3"
        stroke={inverted ? '#2E7D3A' : '#A7CC5C'}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M13 27c0-8.3 5.7-14 14-14 0 8.3-5.7 14-14 14Z" fill={inverted ? '#0B3B2C' : '#EEF5E9'} />
      <path d="M13 27l9.2-9.2" stroke={inverted ? '#EEF5E9' : '#0B3B2C'} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2.7" fill="#A7CC5C" stroke={inverted ? '#EEF5E9' : '#0B3B2C'} strokeWidth="1.5" />
    </svg>
  )
}

export function Logo({ href = '/', className }: { href?: string; dark?: boolean; className?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5 rounded-lg', className)} aria-label="DiAgro — página inicial">
        <Image 
        src={logo}
        alt="DiAgro"
        width={130}
        height={32}
        />
    </Link>
  )
}
