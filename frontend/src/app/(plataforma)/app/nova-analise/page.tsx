import { Suspense } from 'react'
import type { Metadata } from 'next'
import View from './_components/NewAnalysis'

export const metadata: Metadata = { title: 'Nova análise' }
export const instant = false

export default function Page() {
  return (
    <Suspense>
      <View />
    </Suspense>
  )
}
