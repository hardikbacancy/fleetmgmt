import { getFleetContext } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { cancelTrip } from '@/app/actions/trips'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import CompleteTripForm from './CompleteTripForm'

interface Props { params: Promise<{ id: string }> }

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params
  const ctx = await getFleetContext()
  if (!ctx) return null

  const { data: trip } = await ctx.supabase
    .from('trips')
    .select('*, drivers(*), vehicles(*), customers(*)')
    .eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
    .single()

  if (!trip) notFound()

  return (
    <div>
      <PageHeader title="Trip Detail" backHref="/trips" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Trip Information</h2>
              <StatusBadge status={trip.status} />
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Driver</dt><dd className="font-medium text-gray-900 mt-0.5">{trip.drivers?.full_name ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Vehicle</dt><dd className="font-medium text-gray-900 mt-0.5">{trip.vehicles ? `${trip.vehicles.plate_number} · ${trip.vehicles.make} ${trip.vehicles.model}` : '—'}</dd></div>
              <div><dt className="text-gray-500">Customer</dt><dd className="font-medium text-gray-900 mt-0.5">{trip.customers?.full_name ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Started</dt><dd className="font-medium text-gray-900 mt-0.5">{formatDateTime(trip.started_at)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-gray-500">From</dt><dd className="font-medium text-gray-900 mt-0.5">{trip.pickup_address}</dd></div>
              <div className="sm:col-span-2"><dt className="text-gray-500">To</dt><dd className="font-medium text-gray-900 mt-0.5">{trip.dropoff_address}</dd></div>
              {trip.status !== 'in_progress' && <>
                <div><dt className="text-gray-500">Completed</dt><dd className="font-medium text-gray-900 mt-0.5">{trip.completed_at ? formatDateTime(trip.completed_at) : '—'}</dd></div>
                <div><dt className="text-gray-500">Distance</dt><dd className="font-medium text-gray-900 mt-0.5">{trip.distance_km ? `${trip.distance_km} km` : '—'}</dd></div>
                <div><dt className="text-gray-500">Fare</dt><dd className="font-medium text-gray-900 mt-0.5">{formatCurrency(trip.fare_amount)}</dd></div>
                <div><dt className="text-gray-500">Payment</dt><dd className="font-medium text-gray-900 mt-0.5 capitalize">{trip.payment_method}</dd></div>
                {trip.notes && <div className="sm:col-span-2"><dt className="text-gray-500">Notes</dt><dd className="font-medium text-gray-900 mt-0.5">{trip.notes}</dd></div>}
              </>}
            </dl>
          </div>

          {trip.status === 'in_progress' && (
            <CompleteTripForm id={id} currentFare={trip.fare_amount} />
          )}
        </div>

        {trip.status === 'in_progress' && (
          <div>
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Actions</h2>
              <form action={cancelTrip.bind(null, id)}>
                <button type="submit" className="btn-danger w-full">Cancel Trip</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
