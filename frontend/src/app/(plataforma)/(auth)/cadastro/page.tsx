import type { Metadata } from 'next'
import Signup from './_components/SignupForm'

export const metadata: Metadata = { title: 'Criar conta' }
export const instant = false

export default function Page() {
  return <Signup />
}
