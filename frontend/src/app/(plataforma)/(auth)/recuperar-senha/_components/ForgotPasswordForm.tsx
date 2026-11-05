'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Field, Input } from '@/components/common/Field'
import { EMAIL_RE } from '@/lib/format'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setError('Digite um e-mail válido, como nome@exemplo.com.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 700)
  }

  return (
    <div>
      <Link href="/login" className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-agro hover:underline">
        <ArrowLeft className="size-4" /> Voltar para o login
      </Link>
      {sent ? (
        <div className="animate-fade-up">
          <div className="grid size-14 place-items-center rounded-2xl bg-mint text-agro">
            <MailCheck className="size-7" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-ink">Solicitação registrada</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Este é um fluxo demonstrativo: <strong className="font-semibold text-ink">nenhum e-mail foi enviado</strong>. Em uma versão com backend, um link de
            redefinição seria enviado para <strong className="font-semibold text-ink">{email}</strong>.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setSent(false)}>
              Usar outro e-mail
            </Button>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-agro px-5 text-sm font-semibold text-white hover:bg-agro-dark"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-extrabold text-ink">Esqueceu sua senha?</h1>
          <p className="mt-2 text-muted-foreground">Informe o e-mail da sua conta para solicitar a redefinição.</p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            <Field label="E-mail" htmlFor="fp-email" error={error}>
              <Input
                id="fp-email"
                type="email"
                autoComplete="email"
                placeholder="nome@exemplo.com"
                value={email}
                invalid={!!error}
                leading={<Mail className="size-4" />}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
              />
            </Field>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Solicitar redefinição
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
