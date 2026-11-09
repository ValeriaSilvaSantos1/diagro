'use client'

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SeriesPoint } from '@/lib/analytics'
import { OUTCOME_META } from '@/lib/analytics'

interface TooltipPayload {
  name?: string
  value?: number
  color?: string
  payload?: { fill?: string; color?: string }
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-40 rounded-lg border border-line bg-white px-3 py-2.5 text-xs shadow-raised">
      {label && <p className="mb-1.5 font-semibold text-ink">{label}</p>}
      <ul className="space-y-1">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: p.color ?? p.payload?.fill ?? p.payload?.color }} />
              {p.name}
            </span>
            <span className="font-semibold text-ink">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const axis = { fontSize: 11, fill: '#667470' }

export function DonutChart({ data, height = 220, centerLabel = 'análises' }: { data: { name: string; value: number; color: string }[]; height?: number; centerLabel?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="92%" paddingAngle={2} stroke="none" animationDuration={900}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-extrabold text-ink">{total}</span>
        <span className="text-xs text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
  )
}

export function DonutLegend({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.name} className="flex items-center gap-3 text-sm">
          <span className="size-3 shrink-0 rounded-[4px]" style={{ background: d.color }} aria-hidden />
          <span className="flex-1 text-ink-soft">{d.name}</span>
          <span className="font-semibold text-ink">{d.value}</span>
          <span className="w-10 text-right text-xs text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
        </li>
      ))}
    </ul>
  )
}

export function CropBarChart({ data, height = 280 }: { data: { crop: string; healthy: number; disease: number; inconclusive: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }} barCategoryGap={14}>
        <CartesianGrid horizontal={false} stroke="#E2EFDA" strokeDasharray="3 4" />
        <XAxis type="number" allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="crop" tick={{ ...axis, fill: '#0E2820', fontWeight: 600 }} tickLine={false} axisLine={false} width={76} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(238,245,233,0.7)' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="healthy" name="Sem sinais" stackId="a" fill={OUTCOME_META.healthy.color} animationDuration={900} />
        <Bar dataKey="disease" name="Possíveis doenças" stackId="a" fill={OUTCOME_META.disease.color} animationDuration={900} />
        <Bar dataKey="inconclusive" name="Inconclusivo" stackId="a" fill={OUTCOME_META.inconclusive.color} radius={[0, 4, 4, 0]} animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function VolumeBarChart({ data, height = 240 }: { data: SeriesPoint[]; height?: number }) {
  const interval = data.length > 14 ? Math.ceil(data.length / 7) - 1 : 0
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barCategoryGap="22%">
        <CartesianGrid vertical={false} stroke="#E2EFDA" strokeDasharray="3 4" />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} interval={interval} tickMargin={8} />
        <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={44} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(238,245,233,0.7)' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="healthy" name="Sem sinais" stackId="a" fill={OUTCOME_META.healthy.color} />
        <Bar dataKey="disease" name="Possíveis doenças" stackId="a" fill={OUTCOME_META.disease.color} />
        <Bar dataKey="inconclusive" name="Inconclusivo" stackId="a" fill={OUTCOME_META.inconclusive.color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
