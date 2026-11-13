'use client'

import type { Region } from '@/types/domain'
import { useImagemProtegida } from '@/hooks/useImagemProtegida'
import { cn } from '@/lib/format'

type Tone = 'lime' | 'warn'

const TONE: Record<Tone, { box: string; tag: string; corner: string }> = {
  lime: { box: 'border-lime bg-lime/10', tag: 'bg-lime text-forest', corner: 'border-lime' },
  warn: { box: 'border-warn bg-warn/12', tag: 'bg-warn text-forest-deep', corner: 'border-warn' },
}

const CORNERS = [
  '-left-px -top-px border-l-2 border-t-2',
  '-right-px -top-px border-r-2 border-t-2',
  '-left-px -bottom-px border-b-2 border-l-2',
  '-right-px -bottom-px border-b-2 border-r-2',
] as const

export function RoiBox({ region, index, tone = 'lime', delay = 0 }: { region: Region; index: number; tone?: Tone; delay?: number }) {
  const t = TONE[tone]
  return (
    <div
      className="absolute animate-fade-in"
      style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.w}%`, height: `${region.h}%`, animationDelay: `${delay}ms` }}
    >
      <div className={cn('absolute inset-0 rounded-[3px] border-[1.5px] border-dashed', t.box)} />
      {CORNERS.map((pos) => (
        <span key={pos} className={cn('absolute size-2.5', pos, t.corner)} />
      ))}
      <span className={cn('absolute -top-5 left-0 whitespace-nowrap rounded-[4px] px-1.5 py-px font-mono text-[10px] font-bold', t.tag)}>
        ROI {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  )
}

export function ViewfinderCorners({ className, color = 'border-white/80' }: { className?: string; color?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-4', className)} aria-hidden>
      <span className={cn('absolute left-0 top-0 size-6 rounded-tl-md border-l-2 border-t-2', color)} />
      <span className={cn('absolute right-0 top-0 size-6 rounded-tr-md border-r-2 border-t-2', color)} />
      <span className={cn('absolute bottom-0 left-0 size-6 rounded-bl-md border-b-2 border-l-2', color)} />
      <span className={cn('absolute bottom-0 right-0 size-6 rounded-br-md border-b-2 border-r-2', color)} />
    </div>
  )
}

export function ScanLine() {
  return (
    <div className="pointer-events-none absolute inset-x-0 h-16 -translate-y-1/2 animate-scan" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px bg-lime shadow-[0_0_12px_2px_rgba(184,217,134,0.8)]" />
      <div className="absolute inset-x-0 bottom-1/2 h-8 bg-gradient-to-t from-lime/25 to-transparent" />
    </div>
  )
}

interface ScanImageProps {
  src: string
  alt: string
  regions?: Region[]
  tone?: Tone
  scanning?: boolean
  grid?: boolean
  className?: string
  fit?: 'cover' | 'contain'
}

/** Photo with computer-vision style overlays (regions of interest, scan line, grid). */
export function ScanImage({ src, alt, regions = [], tone = 'warn', scanning, grid, className, fit = 'cover' }: ScanImageProps) {
  const url = useImagemProtegida(src)
  return (
    <div className={cn('relative overflow-hidden bg-forest-deep', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt={alt} className={cn('absolute inset-0 size-full', fit === 'cover' ? 'object-cover' : 'object-contain')} />}
      {grid && <div className="absolute inset-0 bg-grid opacity-70" aria-hidden />}
      <ViewfinderCorners />
      {regions.map((r, i) => (
        <RoiBox key={i} region={r} index={i} tone={tone} delay={i * 180} />
      ))}
      {scanning && <ScanLine />}
    </div>
  )
}
