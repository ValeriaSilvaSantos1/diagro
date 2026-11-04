import type { Metadata } from 'next'
import ForgotPassword from './_components/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Recuperar senha' }

export default function Page() {
  return <ForgotPassword />
}
