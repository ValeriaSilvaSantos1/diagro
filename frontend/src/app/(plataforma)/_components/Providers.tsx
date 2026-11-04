'use client'

import type { ReactNode } from 'react'
import { AppStoreProvider } from '@/store/AppStore'
import { ToastProvider } from '@/components/common/Toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppStoreProvider>
      <ToastProvider>{children}</ToastProvider>
    </AppStoreProvider>
  )
}
