import { Suspense } from 'react'
import type { Metadata } from 'next'
import Login from './_components/LoginForm'

export const metadata: Metadata = { title: 'Entrar' }
export const instant = false

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  )
}
