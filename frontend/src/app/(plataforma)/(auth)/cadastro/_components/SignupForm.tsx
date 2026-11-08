'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Checkbox, Field, Input, PasswordInput } from '@/components/common/Field'
import { DemoNotice } from '@/components/common/Misc'
import { useAppStore } from '@/store/AppStore'
import { EMAIL_RE, cn, firstName } from '@/lib/format'

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'terms', string>>

export function passwordStrength(p: string) {
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) score++
  return score
}

export function StrengthMeter({ value }: { value: string }) {
  const s = passwordStrength(value)
  const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte']
  const colors = ['bg-danger', 'bg-danger', 'bg-warn', 'bg-agro', 'bg-agro']
  if (!value) return null
  return (
    <div className="mt-1" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full transition', i < s ? colors[s] : 'bg-line')} />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Força da senha: {labels[s]}</p>
    </div>
  )
}

export default function Signup() {
  const { signup } = useAppStore()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', property: '' })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (form.name.trim().length < 3) next.name = 'Informe seu nome completo.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Digite um e-mail válido, como nome@exemplo.com.'
    if (form.password.length < 8) next.password = 'A senha deve ter pelo menos 8 caracteres.'
    if (form.confirm !== form.password || !form.confirm) next.confirm = 'As senhas não coincidem.'
    if (!terms) next.terms = 'Para continuar, aceite os termos de uso e a política de privacidade.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    window.setTimeout(() => {
      signup({ name: form.name.trim(), email: form.email.trim(), property: form.property.trim() || undefined })
      setLoading(false)
      setDone(true)
    }, 800)
  }

  if (done)
    return (
      <div className="text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-mint text-agro">
          <CircleCheck className="size-8" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-ink">Conta criada!</h1>
        <p className="mt-2 text-muted-foreground">Tudo pronto, {firstName(form.name)}. Sua conta demonstrativa foi salva neste navegador.</p>
        <Button size="lg" className="mt-8 w-full" onClick={() => {
            router.replace('/app')
            setDone(false)
            setTerms(false)
            setForm({ name: '', email: '', password: '', confirm: '', property: '' })
          }} icon={<ArrowRight className="size-5" />}>
          Acessar a plataforma
        </Button>
      </div>
    )

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Crie sua conta</h1>
      <p className="mt-2 text-muted-foreground">Leva menos de um minuto. Você pode completar o perfil depois.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        <Field label="Nome completo" htmlFor="name" error={errors.name}>
          <Input id="name" autoComplete="name" placeholder="Ex.: Maria da Silva" value={form.name} onChange={set('name')} invalid={!!errors.name} />
        </Field>
        <Field label="E-mail" htmlFor="su-email" error={errors.email}>
          <Input id="su-email" type="email" autoComplete="email" placeholder="nome@exemplo.com" value={form.email} onChange={set('email')} invalid={!!errors.email} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Senha" htmlFor="su-password" error={errors.password}>
            <PasswordInput
              id="su-password"
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              value={form.password}
              onChange={set('password')}
              invalid={!!errors.password}
            />
            <StrengthMeter value={form.password} />
          </Field>
          <Field label="Confirmar senha" htmlFor="su-confirm" error={errors.confirm}>
            <PasswordInput id="su-confirm" autoComplete="new-password" placeholder="Repita a senha" value={form.confirm} onChange={set('confirm')} invalid={!!errors.confirm} />
          </Field>
        </div>
        <Field label="Nome da propriedade" htmlFor="su-property" optional>
          <Input id="su-property" placeholder="Ex.: Sítio Boa Esperança" value={form.property} onChange={set('property')} />
        </Field>
        <div>
          <Checkbox
            checked={terms}
            invalid={!!errors.terms}
            onChange={(v) => {
              setTerms(v)
              setErrors((er) => ({ ...er, terms: undefined }))
            }}
            label={
              <>
                Li e aceito os{' '}
                <Link href="/termos" target="_blank" className="font-semibold text-agro hover:underline">
                  termos de uso
                </Link>{' '}
                e a{' '}
                <Link href="/privacidade" target="_blank" className="font-semibold text-agro hover:underline">
                  política de privacidade
                </Link>
                .
              </>
            }
          />
          {errors.terms && (
            <p className="mt-1.5 text-sm text-danger-ink" role="alert">
              {errors.terms}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Criar minha conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link href="/login" className="font-semibold text-agro hover:underline">
          Entrar
        </Link>
      </p>
      <DemoNotice className="mt-8">
        <strong className="font-semibold text-forest">Cadastro demonstrativo.</strong> Os dados ficam apenas neste navegador e não são enviados a nenhum servidor.
      </DemoNotice>
    </div>
  )
}
