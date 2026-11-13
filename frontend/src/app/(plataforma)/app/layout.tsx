import type { ReactNode } from 'react'
import { PlatformLayout } from '@/components/layout/PlatformLayout'

// Área protegida por login: só é montada no navegador, depois de conferir a sessão.
export const instant = false

export default function Layout({ children }: { children: ReactNode }) {
  return <PlatformLayout>{children}</PlatformLayout>
}
