'use server'

import { getFleetContext } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionState } from '@/lib/types'

export async function completeTrip(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { data: trip } = await ctx.supabase
    .from('trips').select('driver_id').eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId).single()

  if (!trip) return { error: 'Trip not found' }

  const { error } = await ctx.supabase.from('trips').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    distance_km: fd.get('distance_km') ? parseFloat(fd.get('distance_km') as string) : null,
    fare_amount: parseFloat(fd.get('fare_amount') as string) || 0,
    payment_method: fd.get('payment_method') as string,
    notes: (fd.get('notes') as string).trim() || null,
  }).eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)

  if (error) return { error: error.message }

  // Set driver back to active
  await ctx.supabase.from('drivers').update({ status: 'active' }).eq('id', trip.driver_id)

  revalidatePath(`/trips/${id}`)
  revalidatePath('/trips')
  revalidatePath('/dashboard')
  redirect('/trips')
}

export async function cancelTrip(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return

  const { data: trip } = await ctx.supabase
    .from('trips').select('driver_id').eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId).single()

  await ctx.supabase.from('trips').update({ status: 'cancelled', completed_at: new Date().toISOString() })
    .eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)

  if (trip?.driver_id) {
    await ctx.supabase.from('drivers').update({ status: 'active' }).eq('id', trip.driver_id)
  }

  revalidatePath('/trips')
}
