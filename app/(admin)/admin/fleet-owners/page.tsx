import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { FleetOwner } from '@/lib/types'
import Link from 'next/link'
import { updateFleetOwnerStatus } from '@/app/actions/admin'

export const revalidate = 0

export default async function FleetOwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('fleet_owners')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const { data: owners } = await query

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fleet Owners</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <Link key={tab.value} href={`/admin/fleet-owners?status=${tab.value}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              (filterStatus ?? 'all') === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(owners ?? []).map((owner: FleetOwner & { profiles: { full_name: string; email: string } | null }) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link href={`/admin/fleet-owners/${owner.id}`} className="hover:text-blue-600">
                      {owner.company_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{owner.profiles?.full_name ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{owner.profiles?.email ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{owner.phone}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(owner.created_at)}</td>
                  <td className="px-6 py-4"><StatusBadge status={owner.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {owner.status === 'pending' && (
                        <form action={updateFleetOwnerStatus.bind(null, owner.id, 'active')}>
                          <button type="submit" className="text-xs font-semibold text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50">
                            Approve
                          </button>
                        </form>
                      )}
                      {owner.status === 'active' && (
                        <form action={updateFleetOwnerStatus.bind(null, owner.id, 'inactive')}>
                          <button type="submit" className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50">
                            Deactivate
                          </button>
                        </form>
                      )}
                      {owner.status === 'inactive' && (
                        <form action={updateFleetOwnerStatus.bind(null, owner.id, 'active')}>
                          <button type="submit" className="text-xs font-semibold text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50">
                            Activate
                          </button>
                        </form>
                      )}
                      <Link href={`/admin/fleet-owners/${owner.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {(owners ?? []).length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No fleet owners found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
