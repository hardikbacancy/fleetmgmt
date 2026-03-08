import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { FleetOwner } from '@/lib/types'
import { BuildingOfficeIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: owners } = await supabase
    .from('fleet_owners')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  const all = owners ?? []
  const pending  = all.filter(o => o.status === 'pending').length
  const active   = all.filter(o => o.status === 'active').length
  const inactive = all.filter(o => o.status === 'inactive').length
  const recent   = all.slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Fleet Owners" value={all.length}
          icon={<BuildingOfficeIcon className="w-5 h-5" />} color="blue" />
        <StatCard title="Active" value={active}
          icon={<CheckCircleIcon className="w-5 h-5" />} color="green" />
        <StatCard title="Pending Approval" value={pending}
          icon={<ClockIcon className="w-5 h-5" />} color="yellow" />
        <StatCard title="Inactive" value={inactive}
          icon={<XCircleIcon className="w-5 h-5" />} color="red" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Registrations</h2>
          <Link href="/admin/fleet-owners" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((owner: FleetOwner & { profiles: { full_name: string; email: string } | null }) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link href={`/admin/fleet-owners/${owner.id}`} className="hover:text-blue-600">
                      {owner.company_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{owner.profiles?.full_name ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(owner.created_at)}</td>
                  <td className="px-6 py-4"><StatusBadge status={owner.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
