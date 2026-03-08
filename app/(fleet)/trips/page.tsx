import { getFleetContext } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import { Trip } from '@/lib/types'
import Link from 'next/link'
import { formatDateTime, formatCurrency } from '@/lib/utils'

export const revalidate = 0

export default async function TripsPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null

  const { data: trips } = await ctx.supabase
    .from('trips')
    .select('*, drivers(full_name), vehicles(plate_number, make, model), customers(full_name)')
    .eq('fleet_owner_id', ctx.fleetOwnerId)
    .order('started_at', { ascending: false })

  return (
    <div>
      <PageHeader title="Trips" subtitle={`${(trips ?? []).length} total`} />
      <div className="card overflow-hidden">
        {(trips ?? []).length === 0 ? (
          <EmptyState icon="🗺️" title="No trips yet" description="Trips are created when you start a confirmed booking." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Started</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fare</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(trips as (Trip & { drivers: { full_name: string } | null; vehicles: { plate_number: string; make: string; model: string } | null; customers: { full_name: string } | null })[]).map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{t.drivers?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{t.vehicles ? `${t.vehicles.plate_number}` : '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{t.customers?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDateTime(t.started_at)}</td>
                    <td className="px-6 py-4 text-gray-700">{formatCurrency(t.fare_amount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4">
                      <Link href={`/trips/${t.id}`} className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 flex justify-end">
                        {t.status === 'in_progress' ? 'Complete' : 'View'}
                      </Link>
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
