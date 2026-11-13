import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/layout/BrandLogo'
import { photo } from '@/lib/demo/images'

export const instant = false

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-forest lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo('farmer', 1600)} alt="Produtor rural cuidando da plantação" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/95 via-forest-deep/40 to-forest-deep/10" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo dark />
          <div className="max-w-lg">
            <h2 className="font-display text-4xl font-extrabold leading-[1.1] text-white xl:text-[44px]">
              Mais tecnologia para cuidar da sua <span className="text-lime">plantação.</span>
            </h2>
            <p className="mt-4 max-w-md text-white/75">Analise folhas por imagem e mantenha o histórico das suas culturas organizado.</p>
          </div>
          <p className="flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="size-4" aria-hidden />
            Conexão segura · suas análises ficam salvas na sua conta
          </p>
        </div>
      </aside>
      <main className="flex flex-col px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div>
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px] animate-fade-up">{children}</div>
        </div>
      </main>
    </div>
  )
}
