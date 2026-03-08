import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { logout } from '@/app/actions/auth'

export default async function FleetLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role
  if (role === 'super_admin') redirect('/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, fleet_owners(*)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.fleet_owner_id) redirect('/login')

  const fleetOwner = (profile as { fleet_owners?: { company_name?: string; status?: string } }).fleet_owners

  // Pending state
  if (fleetOwner?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pending Approval</h2>
          <p className="text-gray-500 mb-6">Your account is under review. A super admin will activate your account shortly.</p>
          <p className="text-sm text-gray-400 mb-6">Company: <strong className="text-gray-700">{fleetOwner?.company_name}</strong></p>
          <form action={logout}>
            <button type="submit" className="btn-secondary">Sign out</button>
          </form>
        </div>
      </div>
    )
  }

  // Inactive state
  if (fleetOwner?.status === 'inactive') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Deactivated</h2>
          <p className="text-gray-500 mb-6">Your account has been deactivated. Please contact support.</p>
          <form action={logout}>
            <button type="submit" className="btn-secondary">Sign out</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        userName={profile.full_name}
        companyName={fleetOwner?.company_name ?? ''}
        role={profile.role}
      />
      <main className="flex-1 overflow-y-auto pt-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:pt-8 pt-16">
          {children}
        </div>
      </main>
    </div>
  )
}
