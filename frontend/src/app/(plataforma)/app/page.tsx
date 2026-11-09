import type { Metadata } from 'next'
import View from './_components/Dashboard'

export const metadata: Metadata = { title: 'Visão geral' }
export const instant = false

export default function Page() {
  return <View />
}
