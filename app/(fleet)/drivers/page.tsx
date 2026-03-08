import { getFleetContext } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import DeleteButton from '@/components/DeleteButton'
import EmptyState from '@/components/EmptyState'
import { deleteDriver } from '@/app/actions/drivers'
import { Driver } from '@/lib/types'
import { PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const revalidate = 0

export default async function DriversPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null
  const { data: drivers } = await ctx.supabase
    .from('drivers').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader title="Drivers" subtitle={`${(drivers ?? []).length} total`} action={{ label: 'Add Driver', href: '/drivers/new' }} />
      <div className="card overflow-hidden">
        {(drivers ?? []).length === 0 ? (
          <EmptyState icon="👤" title="No drivers yet" description="Add your first driver to assign trips." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">License</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(drivers as Driver[]).map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{d.full_name}</p>
                      {d.email && <p className="text-xs text-gray-400">{d.email}</p>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{d.phone}</td>
                    <td className="px-6 py-4 font-mono text-gray-700">{d.license_number}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(d.license_expiry)}</td>
                    <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/drivers/${d.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <DeleteButton action={deleteDriver.bind(null, d.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
