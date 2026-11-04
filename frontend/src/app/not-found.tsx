import { Compass } from 'lucide-react'
import { Logo } from '@/components/layout/BrandLogo'
import { ButtonLink } from '@/components/common/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-6 text-center">
      <Logo />
      <div className="mt-12 grid size-16 place-items-center rounded-2xl bg-mint text-agro">
        <Compass className="size-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-ink">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">O endereço que você tentou acessar não existe ou foi movido.</p>
      <div className="mt-8 flex gap-2">
        <ButtonLink href="/" variant="outline">
          Ir para o site
        </ButtonLink>
        <ButtonLink href="/app">Ir para a plataforma</ButtonLink>
      </div>
    </div>
  )
}
