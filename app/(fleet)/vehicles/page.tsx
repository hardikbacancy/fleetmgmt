import { getFleetContext } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import DeleteButton from '@/components/DeleteButton'
import EmptyState from '@/components/EmptyState'
import { deleteVehicle } from '@/app/actions/vehicles'
import { Vehicle } from '@/lib/types'
import { PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export const revalidate = 0

export default async function VehiclesPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null
  const { data: vehicles } = await ctx.supabase
    .from('vehicles').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader title="Vehicles" subtitle={`${(vehicles ?? []).length} total`} action={{ label: 'Add Vehicle', href: '/vehicles/new' }} />

      <div className="card overflow-hidden">
        {(vehicles ?? []).length === 0 ? (
          <EmptyState icon="🚗" title="No vehicles yet" description="Add your first cab to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(vehicles as Vehicle[]).map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{v.make} {v.model}</td>
                    <td className="px-6 py-4 font-mono text-gray-700">{v.plate_number}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{v.type}</td>
                    <td className="px-6 py-4 text-gray-600">{v.year}</td>
                    <td className="px-6 py-4 text-gray-600">{v.color}</td>
                    <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/vehicles/${v.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <DeleteButton action={deleteVehicle.bind(null, v.id)} />
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
