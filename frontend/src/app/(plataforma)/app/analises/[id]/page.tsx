import type { Metadata } from 'next'
import View from './_components/AnalysisResult'

export const metadata: Metadata = { title: 'Resultado da análise' }
export const instant = false

export default function Page() {
  return <View />
}
