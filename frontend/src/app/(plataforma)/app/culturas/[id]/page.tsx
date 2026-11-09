import type { Metadata } from 'next'
import View from './_components/CropDetail'

export const metadata: Metadata = { title: 'Cultura' }
export const instant = false

export default function Page() {
  return <View />
}
