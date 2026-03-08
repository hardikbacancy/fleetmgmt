import { getFleetContext } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import DeleteButton from '@/components/DeleteButton'
import EmptyState from '@/components/EmptyState'
import { deleteBooking } from '@/app/actions/bookings'
import { Booking } from '@/lib/types'
import Link from 'next/link'
import { formatDateTime, formatCurrency } from '@/lib/utils'

export const revalidate = 0

export default async function BookingsPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null

  const { data: bookings } = await ctx.supabase
    .from('bookings')
    .select('*, customers(full_name, phone), drivers(full_name), vehicles(plate_number)')
    .eq('fleet_owner_id', ctx.fleetOwnerId)
    .order('pickup_datetime', { ascending: false })

  return (
    <div>
      <PageHeader title="Bookings" subtitle={`${(bookings ?? []).length} total`} action={{ label: 'New Booking', href: '/bookings/new' }} />
      <div className="card overflow-hidden">
        {(bookings ?? []).length === 0 ? (
          <EmptyState icon="📅" title="No bookings yet" description="Create a booking to assign trips." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pickup Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fare</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(bookings as (Booking & { customers: { full_name: string; phone: string } | null; drivers: { full_name: string } | null; vehicles: { plate_number: string } | null })[]).map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{b.customers?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{b.customers?.phone ?? ''}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px]">
                      <p className="truncate text-xs">{b.pickup_address}</p>
                      <p className="truncate text-xs text-gray-400">→ {b.dropoff_address}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDateTime(b.pickup_datetime)}</td>
                    <td className="px-6 py-4 text-gray-600">{b.drivers?.full_name ?? <span className="text-gray-400 italic">Unassigned</span>}</td>
                    <td className="px-6 py-4 text-gray-700">{b.fare_amount ? formatCurrency(b.fare_amount) : '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/bookings/${b.id}`} className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50">
                          Manage
                        </Link>
                        {b.status === 'cancelled' && <DeleteButton action={deleteBooking.bind(null, b.id)} />}
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
