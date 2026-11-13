'use client'

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, KeyRound, LogOut, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Field, Select, Switch } from '@/components/common/Field'
import { PageHeader } from '@/components/common/Misc'
import { useToast } from '@/components/common/Toast'
import { useAppStore } from '@/store/AppStore'
import type { Preferences } from '@/types/domain'

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2.5 text-base font-bold text-ink">
        <span className="grid size-8 place-items-center rounded-lg bg-mint text-agro">{icon}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </Card>
  )
}

export default function SettingsPage() {
  const { prefs, setPrefs, logout, user } = useAppStore()
  const toast = useToast()
  const router = useRouter()

  const savePref = (patch: Partial<Preferences>) => {
    setPrefs(patch)
    toast({ title: 'Preferência salva' })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Configurações" subtitle="Preferências, notificações e dados da sua conta." />

      <Section icon={<SlidersHorizontal className="size-4" />} title="Preferências">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Idioma" htmlFor="s-lang">
            <Select id="s-lang" defaultValue="pt-BR" disabled>
              <option value="pt-BR">Português (Brasil)</option>
            </Select>
          </Field>
          <Field label="Unidade de área" htmlFor="s-unit">
            <Select id="s-unit" value={prefs.areaUnit} onChange={(e) => savePref({ areaUnit: e.target.value as Preferences['areaUnit'] })}>
              <option value="ha">Hectare (ha)</option>
              <option value="alqueire">Alqueire</option>
              <option value="m2">Metro quadrado (m²)</option>
            </Select>
          </Field>
        </div>
        <div className="mt-2 border-t border-line">
          <Switch label="Tabelas compactas" description="Mostra linhas mais baixas no histórico." checked={prefs.compactTables} onChange={(v) => savePref({ compactTables: v })} />
        </div>
      </Section>

      <Section icon={<Bell className="size-4" />} title="Notificações">
        <div className="divide-y divide-line">
          <Switch label="Análise concluída" description="Avisar quando um resultado ficar pronto." checked={prefs.notifyAnalysis} onChange={(v) => savePref({ notifyAnalysis: v })} />
          <Switch
            label="Análises que precisam de atenção"
            description="Avisar sobre possíveis sinais ou resultados inconclusivos."
            checked={prefs.notifyAttention}
            onChange={(v) => savePref({ notifyAttention: v })}
          />
        </div>
      </Section>

      <Section icon={<KeyRound className="size-4" />} title="Senha">
        <div className="flex flex-col items-start justify-between gap-3 rounded-lg bg-mist p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-ink-soft">A alteração de senha ainda não está disponível pelo aplicativo.</p>
          <Button variant="outline" size="sm" disabled>
            Alterar senha
          </Button>
        </div>
      </Section>

      <Section icon={<LogOut className="size-4" />} title="Sessão">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-ink">{user.email}</p>
            <p className="text-xs text-muted-foreground">Sessão ativa neste navegador</p>
          </div>
          <Button
            variant="dark"
            icon={<LogOut className="size-4" />}
            onClick={() => {
              logout()
              toast({ title: 'Sessão encerrada', tone: 'info' })
              router.push('/')
            }}
          >
            Encerrar sessão
          </Button>
        </div>
      </Section>

    </div>
  )
}
