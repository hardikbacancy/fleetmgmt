'use server'

import { getFleetContext } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionState } from '@/lib/types'

export async function createBooking(_: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.from('bookings').insert({
    fleet_owner_id: ctx.fleetOwnerId,
    customer_id: fd.get('customer_id') || null,
    driver_id: fd.get('driver_id') || null,
    vehicle_id: fd.get('vehicle_id') || null,
    pickup_address: (fd.get('pickup_address') as string).trim(),
    dropoff_address: (fd.get('dropoff_address') as string).trim(),
    pickup_datetime: fd.get('pickup_datetime') as string,
    fare_amount: fd.get('fare_amount') ? parseFloat(fd.get('fare_amount') as string) : null,
    notes: (fd.get('notes') as string).trim() || null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/bookings')
  redirect('/bookings')
}

export async function updateBookingAssignment(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.from('bookings').update({
    driver_id: fd.get('driver_id') || null,
    vehicle_id: fd.get('vehicle_id') || null,
    fare_amount: fd.get('fare_amount') ? parseFloat(fd.get('fare_amount') as string) : null,
    notes: (fd.get('notes') as string).trim() || null,
  }).eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)

  if (error) return { error: error.message }
  revalidatePath(`/bookings/${id}`)
  return { success: true }
}

export async function confirmBooking(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return
  await ctx.supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  revalidatePath(`/bookings/${id}`)
  revalidatePath('/bookings')
}

export async function cancelBooking(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return
  await ctx.supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  revalidatePath(`/bookings/${id}`)
  revalidatePath('/bookings')
}

export async function startTrip(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { data: booking } = await ctx.supabase
    .from('bookings').select('*').eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId).single()

  if (!booking) return { error: 'Booking not found' }
  if (!booking.driver_id || !booking.vehicle_id) return { error: 'Assign driver and vehicle before starting the trip.' }
  if (booking.status !== 'confirmed') return { error: 'Booking must be confirmed first.' }

  const { data: trip, error } = await ctx.supabase.from('trips').insert({
    booking_id: id,
    fleet_owner_id: ctx.fleetOwnerId,
    driver_id: booking.driver_id,
    vehicle_id: booking.vehicle_id,
    customer_id: booking.customer_id,
    pickup_address: booking.pickup_address,
    dropoff_address: booking.dropoff_address,
    fare_amount: booking.fare_amount ?? 0,
    status: 'in_progress',
    started_at: new Date().toISOString(),
  }).select().single()

  if (error) return { error: error.message }

  // Update driver status to on_trip
  await ctx.supabase.from('drivers').update({ status: 'on_trip' }).eq('id', booking.driver_id)

  revalidatePath('/bookings')
  revalidatePath('/trips')
  redirect(`/trips/${trip.id}`)
}

export async function deleteBooking(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return
  await ctx.supabase.from('bookings').delete().eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  revalidatePath('/bookings')
}
