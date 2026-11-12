'use client'

import { useMemo, useState } from 'react'
import { Download, RotateCcw, SearchX } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader } from '@/components/common/Card'
import { Field, Select } from '@/components/common/Field'
import { DemoNotice, EmptyState, PageHeader } from '@/components/common/Misc'
import { useToast } from '@/components/common/Toast'
import { CropBarChart, DonutChart, DonutLegend, VolumeBarChart } from '@/components/charts/Charts'
import { useAppStore } from '@/store/AppStore'
import { buildSeries, byCrop, distribution, withinDays } from '@/lib/analytics'
import { analysesCsv, downloadFile } from '@/lib/export'

const PERIOD_LABEL: Record<string, string> = { '7': 'últimos 7 dias', '30': 'últimos 30 dias', '90': 'últimos 90 dias' }

export default function Reports() {
  const { analyses } = useAppStore()
  const toast = useToast()
  const [period, setPeriod] = useState('30')
  const [crop, setCrop] = useState('')

  const cropOptions = useMemo(() => [...new Set(analyses.map((a) => a.cropName))].sort(), [analyses])
  const filtered = useMemo(() => analyses.filter((a) => withinDays(a, Number(period)) && (!crop || a.cropName === crop)), [analyses, period, crop])
  const series = useMemo(() => buildSeries(filtered, Number(period)), [filtered, period])
  const dist = useMemo(() => distribution(filtered), [filtered])
  const crops = useMemo(() => byCrop(filtered), [filtered])

  const exportReport = () => {
    const meta = `Período: ${PERIOD_LABEL[period]} · Cultura: ${crop || 'todas'} · ${filtered.length} registros`
    downloadFile(`relatorio-diagro-demonstrativo-${new Date().toISOString().slice(0, 10)}.csv`, analysesCsv(filtered, meta), 'text/csv;charset=utf-8')
    toast({ title: 'Relatório demonstrativo exportado', description: 'Arquivo CSV gerado com os dados fictícios filtrados.' })
  }

  const reset = () => {
    setPeriod('30')
    setCrop('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        subtitle="Entenda a evolução das suas análises ao longo do tempo."
        actions={
          <Button icon={<Download className="size-4" />} onClick={exportReport} disabled={!filtered.length}>
            Exportar relatório demonstrativo
          </Button>
        }
      />

      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end md:max-w-2xl">
          <Field label="Período" htmlFor="r-period">
            <Select id="r-period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </Select>
          </Field>
          <Field label="Cultura" htmlFor="r-crop">
            <Select id="r-crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="">Todas as culturas</option>
              {cropOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Button variant="ghost" icon={<RotateCcw className="size-4" />} onClick={reset} disabled={period === '30' && !crop}>
            Limpar
          </Button>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchX className="size-7" />}
            title="Sem dados para os filtros escolhidos"
            description="Amplie o período ou escolha outra cultura."
            action={
              <Button variant="outline" onClick={reset}>
                Limpar filtros
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <CardHeader title="Total de análises por período" description={`${Number(period) > 30 ? 'Por semana' : 'Por dia'}, separado por classificação`} />
              <p className="text-right">
                <span className="block font-display text-3xl font-extrabold leading-none text-ink">{filtered.length}</span>
                <span className="text-xs text-muted-foreground">análises nos {PERIOD_LABEL[period]}</span>
              </p>
            </div>
            <div className="mt-4">
              <VolumeBarChart data={series} height={280} />
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-12">
            <Card className="p-5 sm:p-6 xl:col-span-5">
              <CardHeader title="Distribuição das classificações" description="Proporção entre os resultados do período" />
              <div className="mt-4 grid items-center gap-6 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <DonutChart data={dist} height={200} />
                <DonutLegend data={dist} />
              </div>
              <p className="mt-5 text-xs text-muted-foreground">Classificações de IA apoiam a decisão, mas não confirmam um diagnóstico agronômico.</p>
            </Card>
            <Card className="p-5 sm:p-6 xl:col-span-7">
              <CardHeader title="Análises por cultura" description="Quantidade de análises e classificações por cultura" />
              <div className="mt-4">
                <CropBarChart data={crops} height={Math.max(200, crops.length * 56 + 60)} />
              </div>
            </Card>
          </div>
        </>
      )}

      <DemoNotice>
        <strong className="font-semibold text-forest">Exportação demonstrativa.</strong> O arquivo é gerado no navegador a partir dos dados fictícios do protótipo e
        identificado como demonstração.
      </DemoNotice>
    </div>
  )
}
