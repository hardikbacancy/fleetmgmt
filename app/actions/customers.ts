'use server'

import { getFleetContext } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionState } from '@/lib/types'

function parseCustomer(fd: FormData) {
  return {
    full_name: (fd.get('full_name') as string).trim(),
    phone: (fd.get('phone') as string).trim(),
    email: ((fd.get('email') as string) || '').trim() || null,
    address: ((fd.get('address') as string) || '').trim() || null,
  }
}

export async function createCustomer(_: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }
  const { error } = await ctx.supabase.from('customers').insert({ ...parseCustomer(fd), fleet_owner_id: ctx.fleetOwnerId })
  if (error) return { error: error.message }
  revalidatePath('/customers')
  redirect('/customers')
}

export async function updateCustomer(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }
  const { error } = await ctx.supabase.from('customers').update(parseCustomer(fd)).eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  if (error) return { error: error.message }
  revalidatePath('/customers')
  redirect('/customers')
}

export async function deleteCustomer(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return
  await ctx.supabase.from('customers').delete().eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  revalidatePath('/customers')
}
