import type { Metadata } from 'next'
import ForgotPassword from './_components/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Recuperar senha' }
export const instant = false

export default function Page() {
  return <ForgotPassword />
}
