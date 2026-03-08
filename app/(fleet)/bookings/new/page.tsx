import { getFleetContext } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import BookingForm from '@/components/forms/BookingForm'
import { createBooking } from '@/app/actions/bookings'

export default async function NewBookingPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null

  const [{ data: customers }, { data: drivers }, { data: vehicles }] = await Promise.all([
    ctx.supabase.from('customers').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).order('full_name'),
    ctx.supabase.from('drivers').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).eq('status', 'active').order('full_name'),
    ctx.supabase.from('vehicles').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).eq('status', 'active').order('plate_number'),
  ])

  return (
    <div>
      <PageHeader title="New Booking" backHref="/bookings" />
      <div className="card p-6 max-w-2xl">
        <BookingForm
          action={createBooking}
          customers={customers ?? []}
          drivers={drivers ?? []}
          vehicles={vehicles ?? []}
        />
      </div>
    </div>
  )
}
