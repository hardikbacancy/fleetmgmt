'use client'

import { useActionState } from 'react'
import { completeTrip, cancelTrip } from '@/app/actions/trips'
import { ActionState } from '@/lib/types'

// Server part — exported as default for the page
import { getFleetContext } from '@/lib/auth'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { formatDateTime, formatCurrency, formatDate } from '@/lib/utils'

interface Props { params: Promise<{ id: string }> }

// Complete trip form (client)
function CompleteTripForm({ id, currentFare }: { id: string; currentFare: number }) {
  'use client'
  const boundAction = completeTrip.bind(null, id)
  const [state, formAction, isPending] = useActionState(boundAction, null as ActionState)

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Complete Trip</h2>
      <form action={formAction} className="space-y-4">
        {state && 'error' in state && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
            <input name="distance_km" type="number" min={0} step={0.1} className="input" placeholder="12.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Fare (₹) *</label>
            <input name="fare_amount" type="number" required min={0} step={0.01} defaultValue={currentFare || ''} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select name="payment_method" className="input">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input name="notes" className="input" placeholder="Any remarks…" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isPending}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            {isPending ? 'Completing…' : '✓ Mark as Completed'}
          </button>
        </div>
      </form>
    </div>
  )
}

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
