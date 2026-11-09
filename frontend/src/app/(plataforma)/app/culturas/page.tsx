import type { Metadata } from 'next'
import View from './_components/Crops'

export const metadata: Metadata = { title: 'Minhas culturas' }
export const instant = false

export default function Page() {
  return <View />
}
