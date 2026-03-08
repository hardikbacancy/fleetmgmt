import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'super_admin') redirect('/admin')
  redirect('/dashboard')
}
