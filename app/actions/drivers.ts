'use server'

import { getFleetContext } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionState } from '@/lib/types'

function parseDriver(fd: FormData) {
  return {
    full_name: (fd.get('full_name') as string).trim(),
    phone: (fd.get('phone') as string).trim(),
    email: ((fd.get('email') as string) || '').trim() || null,
    license_number: (fd.get('license_number') as string).trim().toUpperCase(),
    license_expiry: fd.get('license_expiry') as string,
    status: fd.get('status') as string,
  }
}

export async function createDriver(_: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }
  const payload = parseDriver(fd)
  const { error } = await ctx.supabase.from('drivers').insert({ ...payload, fleet_owner_id: ctx.fleetOwnerId })
  if (error) return { error: error.message }
  revalidatePath('/drivers')
  redirect('/drivers')
}

export async function updateDriver(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }
  const payload = parseDriver(fd)
  const { error } = await ctx.supabase.from('drivers').update(payload).eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  if (error) return { error: error.message }
  revalidatePath('/drivers')
  redirect('/drivers')
}

export async function deleteDriver(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return
  await ctx.supabase.from('drivers').delete().eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  revalidatePath('/drivers')
}
