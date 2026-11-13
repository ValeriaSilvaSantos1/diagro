import { Suspense } from 'react'
import type { Metadata } from 'next'
import View from './_components/History'

export const metadata: Metadata = { title: 'Histórico' }
export const instant = false

export default function Page() {
  return (
    <Suspense>
      <View />
    </Suspense>
  )
}
