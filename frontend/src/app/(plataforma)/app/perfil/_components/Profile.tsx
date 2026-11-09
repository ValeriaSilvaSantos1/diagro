'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Settings, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Field, Input } from '@/components/common/Field'
import { DemoNotice, PageHeader } from '@/components/common/Misc'
import { useToast } from '@/components/common/Toast'
import { useAppStore } from '@/store/AppStore'
import { EMAIL_RE, initials } from '@/lib/format'

export default function Profile() {
  const { user, updateUser, analyses, crops, prefs } = useAppStore()
  const unitLabel = { ha: 'ha', alqueire: 'alqueires', m2: 'm²' }[prefs.areaUnit]
  const toast = useToast()
  const [personal, setPersonal] = useState({ name: user.name, email: user.email })
  const [pErrors, setPErrors] = useState<{ name?: string; email?: string }>({})
  const [property, setProperty] = useState({ property: user.property ?? '', propertyArea: user.propertyArea ?? '', mainCrops: user.mainCrops ?? '' })
  const [areaError, setAreaError] = useState('')

  const savePersonal = (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof pErrors = {}
    if (personal.name.trim().length < 3) errs.name = 'Informe seu nome completo.'
    if (!EMAIL_RE.test(personal.email.trim())) errs.email = 'Digite um e-mail válido.'
    setPErrors(errs)
    if (Object.keys(errs).length) return
    updateUser({ name: personal.name.trim(), email: personal.email.trim() })
    toast({ title: 'Dados pessoais atualizados' })
  }

  const saveProperty = (e: FormEvent) => {
    e.preventDefault()
    if (property.propertyArea && !/^\d+([.,]\d+)?$/.test(property.propertyArea.trim())) {
      setAreaError('Use apenas números, por exemplo 25 ou 12,5.')
      return
    }
    updateUser({
      property: property.property.trim() || undefined,
      propertyArea: property.propertyArea.trim() || undefined,
      mainCrops: property.mainCrops.trim() || undefined,
    })
    toast({ title: 'Informações da propriedade salvas' })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" subtitle="Gerencie suas informações pessoais e os dados da sua propriedade." />
      <DemoNotice>
        <strong className="font-semibold text-forest">Edição local.</strong> Por enquanto as alterações desta tela ficam salvas só neste navegador; o
        cadastro no servidor não é alterado.
      </DemoNotice>

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
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">Dados pessoais</h2>
            <form onSubmit={savePersonal} noValidate className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo" htmlFor="p-name" error={pErrors.name}>
                  <Input id="p-name" value={personal.name} invalid={!!pErrors.name} onChange={(e) => setPersonal((s) => ({ ...s, name: e.target.value }))} />
                </Field>
                <Field label="E-mail" htmlFor="p-email" error={pErrors.email}>
                  <Input
                    id="p-email"
                    type="email"
                    value={personal.email}
                    invalid={!!pErrors.email}
                    onChange={(e) => setPersonal((s) => ({ ...s, email: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Salvar dados pessoais</Button>
              </div>
            </form>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">Informações da propriedade</h2>
            <p className="mt-1 text-sm text-muted-foreground">Todas as informações são opcionais.</p>
            <form onSubmit={saveProperty} noValidate className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome da propriedade" htmlFor="p-prop" optional>
                  <Input
                    id="p-prop"
                    placeholder="Ex.: Sítio Boa Esperança"
                    value={property.property}
                    onChange={(e) => setProperty((s) => ({ ...s, property: e.target.value }))}
                  />
                </Field>
                <Field label={`Área total (${unitLabel})`} htmlFor="p-area" optional error={areaError} hint="A unidade pode ser alterada em Configurações.">
                  <Input
                    id="p-area"
                    inputMode="decimal"
                    placeholder="Ex.: 25"
                    value={property.propertyArea}
                    invalid={!!areaError}
                    onChange={(e) => {
                      setProperty((s) => ({ ...s, propertyArea: e.target.value }))
                      setAreaError('')
                    }}
                  />
                </Field>
              </div>
              <Field label="Principais culturas" htmlFor="p-crops" optional>
                <Input
                  id="p-crops"
                  placeholder="Ex.: tomate, milho"
                  value={property.mainCrops}
                  onChange={(e) => setProperty((s) => ({ ...s, mainCrops: e.target.value }))}
                />
              </Field>
              <div className="flex items-start gap-2 rounded-lg bg-mist p-3 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-agro" aria-hidden />
                Não solicitamos localização precisa, documentos ou outros dados pessoais desnecessários.
              </div>
              <div className="flex justify-end">
                <Button type="submit">Salvar propriedade</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
