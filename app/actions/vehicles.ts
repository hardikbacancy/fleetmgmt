'use server'

import { getFleetContext } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionState } from '@/lib/types'

function parseVehicle(fd: FormData) {
  return {
    make: (fd.get('make') as string).trim(),
    model: (fd.get('model') as string).trim(),
    year: parseInt(fd.get('year') as string),
    plate_number: (fd.get('plate_number') as string).trim().toUpperCase(),
    type: fd.get('type') as string,
    color: (fd.get('color') as string).trim(),
    status: fd.get('status') as string,
  }
}

export async function createVehicle(_: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }
  const payload = parseVehicle(fd)
  const { error } = await ctx.supabase.from('vehicles').insert({ ...payload, fleet_owner_id: ctx.fleetOwnerId })
  if (error) return { error: error.message }
  revalidatePath('/vehicles')
  redirect('/vehicles')
}

export async function updateVehicle(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }
  const payload = parseVehicle(fd)
  const { error } = await ctx.supabase.from('vehicles').update(payload).eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  if (error) return { error: error.message }
  revalidatePath('/vehicles')
  redirect('/vehicles')
}

export async function deleteVehicle(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return
  await ctx.supabase.from('vehicles').delete().eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  revalidatePath('/vehicles')
}
