import { getFleetContext } from '@/lib/auth'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { confirmBooking, cancelBooking, startTrip, updateBookingAssignment } from '@/app/actions/bookings'
import AssignForm from './AssignForm'

interface Props { params: Promise<{ id: string }> }

export const revalidate = 0

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params
  const ctx = await getFleetContext()
  if (!ctx) return null

  const { data: booking } = await ctx.supabase
    .from('bookings')
    .select('*, customers(*), drivers(*), vehicles(*)')
    .eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
    .single()

  if (!booking) notFound()

  const [{ data: drivers }, { data: vehicles }] = await Promise.all([
    ctx.supabase.from('drivers').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).in('status', ['active', 'on_trip']).order('full_name'),
    ctx.supabase.from('vehicles').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).in('status', ['active']).order('plate_number'),
  ])

  const canConfirm  = booking.status === 'pending'
  const canStart    = booking.status === 'confirmed' && booking.driver_id && booking.vehicle_id
  const canCancel   = booking.status !== 'cancelled'
  const canAssign   = booking.status !== 'cancelled'

  return (
    <div>
      <PageHeader title="Booking Detail" backHref="/bookings" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Trip Details</h2>
              <StatusBadge status={booking.status} />
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Customer</dt><dd className="font-medium text-gray-900 mt-0.5">{booking.customers?.full_name ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900 mt-0.5">{booking.customers?.phone ?? '—'}</dd></div>
              <div className="sm:col-span-2"><dt className="text-gray-500">Pickup</dt><dd className="font-medium text-gray-900 mt-0.5">{booking.pickup_address}</dd></div>
              <div className="sm:col-span-2"><dt className="text-gray-500">Drop-off</dt><dd className="font-medium text-gray-900 mt-0.5">{booking.dropoff_address}</dd></div>
              <div><dt className="text-gray-500">Pickup Time</dt><dd className="font-medium text-gray-900 mt-0.5">{formatDateTime(booking.pickup_datetime)}</dd></div>
              <div><dt className="text-gray-500">Fare</dt><dd className="font-medium text-gray-900 mt-0.5">{booking.fare_amount ? formatCurrency(booking.fare_amount) : '—'}</dd></div>
              {booking.notes && <div className="sm:col-span-2"><dt className="text-gray-500">Notes</dt><dd className="font-medium text-gray-900 mt-0.5">{booking.notes}</dd></div>}
            </dl>
          </div>

          {/* Assignment form */}
          {canAssign && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Driver &amp; Vehicle Assignment</h2>
              <AssignForm
                bookingId={id}
                action={updateBookingAssignment.bind(null, id)}
                drivers={drivers ?? []}
                vehicles={vehicles ?? []}
                currentDriverId={booking.driver_id}
                currentVehicleId={booking.vehicle_id}
                currentFare={booking.fare_amount}
                currentNotes={booking.notes}
              />
            </div>
          )}
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Assignment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Driver</span>
                <span className="font-medium text-gray-900">{booking.drivers?.full_name ?? <em className="text-gray-400">Unassigned</em>}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle</span>
                <span className="font-medium text-gray-900">{booking.vehicles ? `${booking.vehicles.plate_number}` : <em className="text-gray-400">Unassigned</em>}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 mb-2">Actions</h2>

            {canConfirm && (
              <form action={confirmBooking.bind(null, id)}>
                <button type="submit" className="btn-primary w-full">✓ Confirm Booking</button>
              </form>
            )}

            {canStart && (
              <form action={startTrip.bind(null, id)}>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                  ▶ Start Trip
                </button>
              </form>
            )}

            {!canStart && booking.status === 'confirmed' && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                Assign both driver and vehicle to start the trip.
              </p>
            )}

            {canCancel && (
              <form action={cancelBooking.bind(null, id)}>
                <button type="submit" className="btn-danger w-full">✕ Cancel Booking</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
