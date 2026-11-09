import type { Metadata } from 'next'
import View from './_components/Reports'

export const metadata: Metadata = { title: 'Relatórios' }
export const instant = false

export default function Page() {
  return <View />
}
