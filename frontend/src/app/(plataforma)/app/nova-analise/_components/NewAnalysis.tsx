'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Circle, CircleCheck, Crosshair, FlaskConical, Focus, Leaf, ScanSearch, Sun, X } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { DemoBadge } from '@/components/common/Badge'
import { Field, Input, Select, Textarea } from '@/components/common/Field'
import { DemoNotice, PageHeader, Segmented } from '@/components/common/Misc'
import { useToast } from '@/components/common/Toast'
import { ImageUploader, type SelectedImage } from '@/components/analysis/ImageUploader'
import { PROCESSING_STEPS, ProcessingSteps } from '@/components/analysis/ProcessingSteps'
import { ScanImage } from '@/components/analysis/ScanOverlay'
import { DEMO_CROP_OPTIONS } from '@/lib/demo/seed'
import { useAppStore } from '@/store/AppStore'
import { simulateResult, type Scenario } from '@/lib/demo/simulate'
import { pendingImage } from '@/lib/handoff'
import { cn } from '@/lib/format'

const TIPS = [
  { icon: Sun, text: 'Fotografe em local bem iluminado' },
  { icon: Focus, text: 'Evite imagens desfocadas' },
  { icon: Leaf, text: 'Prefira uma folha por imagem' },
  { icon: Crosshair, text: 'Enquadre a região com alterações' },
]

const NOT_INFORMED = '__none__'

export default function NewAnalysis() {
  const { crops, user, addAnalysis, pushNotification, prefs } = useAppStore()
  const params = useSearchParams()
  const router = useRouter()
  const toast = useToast()
  const uploaderRef = useRef<HTMLDivElement>(null)

  const initialCrop = params.get('cultura')
  // Foto escolhida aqui, ou a que veio do card "Analisar uma folha" do dashboard.
  const [picked, setPicked] = useState<SelectedImage | null>(null)
  const passed = useSyncExternalStore(pendingImage.subscribe, pendingImage.get, pendingImage.getServer)
  const image = picked ?? passed
  const setImage = (v: SelectedImage | null) => {
    pendingImage.clear()
    setPicked(v)
  }
  const [imageError, setImageError] = useState<string>()
  const [crop, setCrop] = useState<string>(initialCrop && crops.some((c) => c.id === initialCrop) ? initialCrop : (crops[0]?.id ?? NOT_INFORMED))
  const [property, setProperty] = useState(user.property ?? '')
  const [notes, setNotes] = useState('')
  const [scenario, setScenario] = useState<Scenario>('auto')
  const [step, setStep] = useState(-1)

  const otherCrops = useMemo(() => DEMO_CROP_OPTIONS.filter((o) => !crops.some((c) => c.name === o)), [crops])
  const processing = step >= 0

  const resolveCrop = () => {
    const mine = crops.find((c) => c.id === crop)
    if (mine) return { cropId: mine.id, cropName: mine.name }
    if (crop === NOT_INFORMED) return { cropId: null, cropName: 'Não informado' }
    return { cropId: null, cropName: crop.replace(/^demo:/, '') }
  }

  const finish = (img: SelectedImage) => {
    const { cropId, cropName } = resolveCrop()
    const created = addAnalysis({
      cropId,
      cropName,
      image: img.dataUrl,
      property: property.trim() || undefined,
      notes: notes.trim() || undefined,
      ...simulateResult(scenario, cropName),
    })
    if (prefs.notifyAnalysis)
      pushNotification({ title: 'Análise concluída', description: `${created.id} · ${cropName} (resultado demonstrativo)`, href: `/app/analises/${created.id}` })
    if (prefs.notifyAttention && created.outcome !== 'healthy')
      pushNotification({
        title: created.outcome === 'disease' ? 'Análise precisa de atenção' : 'Resultado inconclusivo',
        description:
          created.outcome === 'disease' ? `${created.id} · possíveis sinais identificados (exemplo fictício)` : `${created.id} · tente enviar uma foto mais nítida`,
        href: `/app/analises/${created.id}`,
      })
    toast({ title: 'Análise concluída', description: 'O resultado demonstrativo está pronto.' })
    router.replace(`/app/analises/${created.id}`)
    // Com cacheComponents esta tela fica preservada em segundo plano; limpa para a próxima análise.
    setStep(-1)
    setImage(null)
    setNotes('')
  }

  // Avança as etapas simuladas; ao fim da última, registra a análise e abre o resultado.
  useEffect(() => {
    if (!processing || !image) return
    const t = window.setTimeout(
      () => (step < PROCESSING_STEPS.length - 1 ? setStep((s) => s + 1) : finish(image)),
      step === 0 ? 900 : 1100,
    )
    return () => window.clearTimeout(t)
    // Reage só ao avanço das etapas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, processing])


  const start = () => {
    if (!image) {
      setImageError('Selecione uma imagem da folha antes de iniciar a análise.')
      uploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast({ title: 'Nenhuma imagem selecionada', description: 'Envie ou fotografe uma folha para continuar.', tone: 'error' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep(0)
  }

  if (processing && image) return <Processing image={image} step={step} onCancel={() => setStep(-1)} />

  const cropLabel = resolveCrop().cropName

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={<DemoBadge label="Análise demonstrativa" />} title="Analisar uma planta" subtitle="Envie uma imagem nítida da folha para iniciar a análise." />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main: upload */}
        <Card className="overflow-hidden" ref={uploaderRef}>
          <div className="p-4 sm:p-6">
            <ImageUploader
              value={image}
              error={imageError}
              onChange={(v) => {
                setImage(v)
                setImageError(undefined)
              }}
            />
          </div>
          <div className="border-t border-line bg-mist/60 px-4 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dicas para a foto</p>
            <ul className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-4">
              {TIPS.map((t) => (
                <li key={t.text} className="flex items-center gap-2 text-sm text-ink-soft">
                  <t.icon className="size-4 shrink-0 text-agro" aria-hidden />
                  {t.text}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Side: details + action */}
        <Card className="p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-base font-bold text-ink">Informações da análise</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Só a imagem é obrigatória.</p>
          <div className="mt-5 space-y-4">
            <Field label="Cultura agrícola" htmlFor="crop" hint="Lista demonstrativa: não indica que todas as culturas são suportadas pelo modelo.">
              <Select id="crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
                {crops.length > 0 && (
                  <optgroup label="Minhas culturas">
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Outras culturas">
                  {otherCrops.map((o) => (
                    <option key={o} value={`demo:${o}`}>
                      {o}
                    </option>
                  ))}
                </optgroup>
                <option value={NOT_INFORMED}>Não informado</option>
              </Select>
            </Field>
            <Field label="Nome da propriedade" htmlFor="property" optional>
              <Input id="property" placeholder="Ex.: Sítio Boa Esperança" value={property} onChange={(e) => setProperty(e.target.value)} />
            </Field>
            <Field label="Observações" htmlFor="notes" optional>
              <Textarea id="notes" rows={3} maxLength={280} placeholder="Ex.: manchas surgiram após as chuvas" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>

          <ul className="mt-6 space-y-2 rounded-lg bg-mist p-3 text-sm" aria-label="Resumo antes do envio">
            <CheckRow ok={!!image} label={image ? 'Imagem selecionada' : 'Selecione uma imagem'} />
            <CheckRow ok label={`Cultura: ${cropLabel}`} />
          </ul>

          <div className="mt-4 hidden md:block">
            <Button size="lg" className="w-full" icon={<ScanSearch className="size-5" />} onClick={start}>
              Analisar imagem
            </Button>
          </div>

          <details className="group mt-5 rounded-lg border border-dashed border-agro/35 bg-mint/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-forest [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <FlaskConical className="size-4 text-agro" aria-hidden /> Opções da demonstração
              </span>
              <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" aria-hidden />
            </summary>
            <div className="px-3 pb-3">
              <p className="text-xs text-muted-foreground">Sem modelo de IA conectado, o resultado é fictício. Escolha qual cenário deseja visualizar.</p>
              <Segmented
                className="mt-2.5 w-full flex-wrap [&>button]:flex-1"
                label="Cenário do resultado demonstrativo"
                value={scenario}
                onChange={setScenario}
                options={[
                  { value: 'auto', label: 'Aleatório' },
                  { value: 'disease', label: 'Possível doença' },
                  { value: 'healthy', label: 'Sem sinais' },
                  { value: 'inconclusive', label: 'Inconclusivo' },
                ]}
              />
            </div>
          </details>
        </Card>
      </div>

      {/* Mobile: action always within reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <Button size="lg" className="w-full" icon={<ScanSearch className="size-5" />} onClick={start}>
          Analisar imagem
        </Button>
      </div>
    </div>
  )
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={cn('flex items-center gap-2', ok ? 'text-ink' : 'text-muted-foreground')}>
      {ok ? <CircleCheck className="size-4 shrink-0 text-agro" aria-hidden /> : <Circle className="size-4 shrink-0" aria-hidden />}
      <span className="truncate">{label}</span>
    </li>
  )
}

function Processing({ image, step, onCancel }: { image: SelectedImage; step: number; onCancel: () => void }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<DemoBadge label="Processamento demonstrativo" />}
        title="Analisando a imagem…"
        subtitle="Isso leva apenas alguns segundos. Não feche esta página."
      />
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          <ScanImage
            src={image.dataUrl}
            alt="Folha enviada em processamento"
            className="aspect-[4/3] lg:aspect-auto lg:min-h-[440px]"
            fit="contain"
            tone="lime"
            scanning
          />
          <div className="flex flex-col p-6 sm:p-8">
            <ProcessingSteps current={Math.min(step, PROCESSING_STEPS.length - 1)} />
            <DemoNotice className="mt-6">
              <strong className="font-semibold text-forest">Simulação.</strong> Nenhum modelo de inteligência artificial está conectado. O resultado será fictício e
              identificado como demonstração.
            </DemoNotice>
            <div className="mt-auto pt-6">
              <Button variant="ghost" icon={<X className="size-4" />} onClick={onCancel}>
                Cancelar análise
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
