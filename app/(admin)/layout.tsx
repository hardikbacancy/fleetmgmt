import { getSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'super_admin') redirect('/dashboard')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', session.userId)
    .single()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar userName={profile?.full_name ?? 'Admin'} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
