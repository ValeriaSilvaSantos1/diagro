'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Field, Input, PasswordInput } from '@/components/common/Field'
import { useToast } from '@/components/common/Toast'
import { useAppStore } from '@/store/AppStore'
import { login as authenticate } from '@/services/auth'
import { EMAIL_RE } from '@/lib/format'

export default function Login() {
  const { login } = useAppStore()
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  // Only accept internal paths to avoid open redirects.
  const fromParam = params.get('from')
  const from = fromParam && fromParam.startsWith('/app') ? fromParam : '/app'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Informe seu e-mail.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Digite um e-mail válido, como nome@exemplo.com.'
    if (!password) next.password = 'Informe sua senha.'
    else if (password.length < 6) next.password = 'A senha deve ter pelo menos 6 caracteres.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    try {
      const result = await authenticate(email.trim(), password)
      login(
        {
          name: result.user.nome,
          email: result.user.email,
        },
        result.token,
        true,
      )
      toast({ title: 'Bem-vindo de volta!', description: 'Você entrou no DiAgro.' })
      router.replace(from)
      setPassword('')
    } catch (error) {
      toast({
        title: 'Não foi possível entrar',
        description: error instanceof Error ? error.message : 'Verifique seu e-mail e sua senha.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Entrar no DiAgro</h1>
      <p className="mt-2 text-muted-foreground">Acesse para analisar suas plantas e consultar o histórico.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <Field label="E-mail" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nome@exemplo.com"
            value={email}
            invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            leading={<Mail className="size-4" />}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <div>
          <Field label="Senha" htmlFor="password" error={errors.password}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={password}
              invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <div className="mt-2 text-right">
            <Link href="/recuperar-senha" className="text-sm font-semibold text-agro hover:underline">
              Esqueci minha senha
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem uma conta?{' '}
        <Link href="/cadastro" className="font-semibold text-agro hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
