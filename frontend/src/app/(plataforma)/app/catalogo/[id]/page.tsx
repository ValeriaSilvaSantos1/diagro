import type { Metadata } from 'next'
import View from './_components/CatalogDetail'

export const metadata: Metadata = { title: 'Catálogo de doenças' }
export const instant = false

export default function Page() {
  return <View />
}
