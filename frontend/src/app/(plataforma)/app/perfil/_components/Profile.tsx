'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { RotateCcw, Settings, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Field, Input } from '@/components/common/Field'
import { PageHeader } from '@/components/common/Misc'
import { useToast } from '@/components/common/Toast'
import { useAppStore } from '@/store/AppStore'
import { ApiError } from '@/services/api'
import { atualizarPerfil, usuarioDaApi, type PerfilPatch } from '@/services/auth'
import { EMAIL_RE, initials } from '@/lib/format'

const AREA_RE = /^\d{1,10}([.,]\d{1,2})?$/

/** Envia a edição para a API e atualiza o usuário da sessão com o que o banco gravou. */
function useSalvarPerfil() {
  const { updateUser } = useAppStore()
  const toast = useToast()
  const [salvando, setSalvando] = useState(false)

  const salvar = async (dados: PerfilPatch, sucesso: string): Promise<ApiError | null> => {
    setSalvando(true)
    try {
      updateUser(usuarioDaApi(await atualizarPerfil(dados)))
      toast({ title: sucesso })
      return null
    } catch (erro) {
      const apiErro = erro instanceof ApiError ? erro : new ApiError('Erro de conexão', 0)
      if (apiErro.status !== 409) {
        toast({
          title: 'Não foi possível salvar',
          description: apiErro.status === 401 ? 'Sua sessão expirou. Entre novamente.' : 'Confira sua conexão e tente de novo.',
          tone: 'error',
        })
      }
      return apiErro
    } finally {
      setSalvando(false)
    }
  }
  return { salvar, salvando }
}

export default function Profile() {
  const { user, analyses, crops } = useAppStore()

  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" subtitle="Gerencie suas informações pessoais e os dados da sua propriedade." />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="h-fit overflow-hidden lg:col-span-4">
          <div className="relative h-24 bg-forest">
            <div className="absolute inset-0 bg-grid" aria-hidden />
          </div>
          <div className="-mt-10 px-6 pb-6">
            <span className="relative grid size-20 place-items-center rounded-2xl bg-lime font-display text-2xl font-extrabold text-forest ring-4 ring-white">
              {initials(user.name)}
            </span>
            <h2 className="mt-4 text-xl font-bold text-ink">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.property && <p className="mt-1 text-sm font-medium text-ink-soft">{user.property}</p>}
            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 text-center">
              <div className="rounded-lg bg-mist p-3">
                <dt className="text-xs text-muted-foreground">Análises</dt>
                <dd className="font-display text-xl font-extrabold text-ink">{analyses.length}</dd>
              </div>
              <div className="rounded-lg bg-mist p-3">
                <dt className="text-xs text-muted-foreground">Culturas</dt>
                <dd className="font-display text-xl font-extrabold text-ink">{crops.length}</dd>
              </div>
            </dl>
            <Link href="/app/configuracoes" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-agro hover:underline">
              <Settings className="size-4" /> Preferências e segurança
            </Link>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-8">
          {/* A key recria o formulário quando os dados chegam da API ou são salvos. */}
          <PersonalForm key={`${user.name}|${user.email}`} name={user.name} email={user.email} />
          <PropertyForm
            key={`${user.property}|${user.propertyArea}|${user.mainCrops}`}
            property={user.property ?? ''}
            propertyArea={user.propertyArea ?? ''}
            mainCrops={user.mainCrops ?? ''}
          />
        </div>
      </div>
    </div>
  )
}

function PersonalForm(inicial: { name: string; email: string }) {
  const { salvar, salvando } = useSalvarPerfil()
  const [form, setForm] = useState(inicial)
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const alterado = form.name.trim() !== inicial.name || form.email.trim().toLowerCase() !== inicial.email.toLowerCase()

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (form.name.trim().length < 3) errs.name = 'Informe seu nome completo.'
    if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Digite um e-mail válido.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const erro = await salvar({ nome: form.name.trim(), email: form.email.trim() }, 'Dados pessoais atualizados')
    if (erro?.status === 409) setErrors({ email: 'Este e-mail já está em uso por outra conta.' })
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-bold text-ink">Dados pessoais</h2>
      <p className="mt-1 text-sm text-muted-foreground">Ao trocar o e-mail, use o novo endereço para entrar na próxima vez.</p>
      <form onSubmit={enviar} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" htmlFor="p-name" error={errors.name}>
            <Input
              id="p-name"
              autoComplete="name"
              value={form.name}
              invalid={!!errors.name}
              onChange={(e) => {
                setForm((s) => ({ ...s, name: e.target.value }))
                setErrors((s) => ({ ...s, name: undefined }))
              }}
            />
          </Field>
          <Field label="E-mail" htmlFor="p-email" error={errors.email}>
            <Input
              id="p-email"
              type="email"
              autoComplete="email"
              value={form.email}
              invalid={!!errors.email}
              onChange={(e) => {
                setForm((s) => ({ ...s, email: e.target.value }))
                setErrors((s) => ({ ...s, email: undefined }))
              }}
            />
          </Field>
        </div>
        <FormActions
          alterado={alterado}
          salvando={salvando}
          label="Salvar dados pessoais"
          onDesfazer={() => {
            setForm(inicial)
            setErrors({})
          }}
        />
      </form>
    </Card>
  )
}

function PropertyForm(inicial: { property: string; propertyArea: string; mainCrops: string }) {
  const { prefs } = useAppStore()
  const unitLabel = { ha: 'ha', alqueire: 'alqueires', m2: 'm²' }[prefs.areaUnit]
  const { salvar, salvando } = useSalvarPerfil()
  const [form, setForm] = useState(inicial)
  const [areaError, setAreaError] = useState('')
  const alterado =
    form.property.trim() !== inicial.property || form.propertyArea.trim() !== inicial.propertyArea || form.mainCrops.trim() !== inicial.mainCrops
  const set = (campo: keyof typeof form) => (e: { target: { value: string } }) => setForm((s) => ({ ...s, [campo]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    const area = form.propertyArea.trim()
    if (area && (!AREA_RE.test(area) || Number(area.replace(',', '.')) <= 0)) {
      setAreaError('Use um número maior que zero, com até duas casas decimais, por exemplo 25 ou 12,5.')
      return
    }
    await salvar(
      {
        propriedade: form.property.trim() || null,
        area_propriedade: area ? Number(area.replace(',', '.')) : null,
        culturas_principais: form.mainCrops.trim() || null,
      },
      'Informações da propriedade salvas',
    )
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-bold text-ink">Informações da propriedade</h2>
      <p className="mt-1 text-sm text-muted-foreground">Todas as informações são opcionais. Deixe um campo vazio para apagá-lo.</p>
      <form onSubmit={enviar} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da propriedade" htmlFor="p-prop" optional>
            <Input id="p-prop" maxLength={120} placeholder="Ex.: Sítio Boa Esperança" value={form.property} onChange={set('property')} />
          </Field>
          <Field label={`Área total (${unitLabel})`} htmlFor="p-area" optional error={areaError} hint="A unidade pode ser alterada em Configurações.">
            <Input
              id="p-area"
              inputMode="decimal"
              placeholder="Ex.: 25"
              value={form.propertyArea}
              invalid={!!areaError}
              onChange={(e) => {
                set('propertyArea')(e)
                setAreaError('')
              }}
            />
          </Field>
        </div>
        <Field label="Principais culturas" htmlFor="p-crops" optional>
          <Input id="p-crops" maxLength={200} placeholder="Ex.: arroz, milho" value={form.mainCrops} onChange={set('mainCrops')} />
        </Field>
        <div className="flex items-start gap-2 rounded-lg bg-mist p-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-agro" aria-hidden />
          Não solicitamos localização precisa, documentos ou outros dados pessoais desnecessários.
        </div>
        <FormActions
          alterado={alterado}
          salvando={salvando}
          label="Salvar propriedade"
          onDesfazer={() => {
            setForm(inicial)
            setAreaError('')
          }}
        />
      </form>
    </Card>
  )
}

function FormActions({ alterado, salvando, label, onDesfazer }: { alterado: boolean; salvando: boolean; label: string; onDesfazer: () => void }) {
  return (
    <div className="flex flex-col-reverse items-stretch justify-end gap-2 sm:flex-row sm:items-center">
      {alterado && !salvando && (
        <Button variant="ghost" icon={<RotateCcw className="size-4" />} onClick={onDesfazer}>
          Desfazer alterações
        </Button>
      )}
      <Button type="submit" loading={salvando} disabled={!alterado}>
        {label}
      </Button>
    </div>
  )
}
