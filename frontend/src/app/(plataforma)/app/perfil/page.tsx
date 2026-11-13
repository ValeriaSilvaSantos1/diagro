import type { Metadata } from 'next'
import View from './_components/Profile'

export const metadata: Metadata = { title: 'Meu perfil' }
export const instant = false

export default function Page() {
  return <View />
}
