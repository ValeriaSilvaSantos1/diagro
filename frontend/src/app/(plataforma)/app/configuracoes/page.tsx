import type { Metadata } from 'next'
import View from './_components/Settings'

export const metadata: Metadata = { title: 'Configurações' }
export const instant = false

export default function Page() {
  return <View />
}
