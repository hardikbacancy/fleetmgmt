'use server'

import { getFleetContext } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionState } from '@/lib/types'

export async function createExpense(_: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getFleetContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.from('expenses').insert({
    fleet_owner_id: ctx.fleetOwnerId,
    category: fd.get('category') as string,
    amount: parseFloat(fd.get('amount') as string),
    description: (fd.get('description') as string).trim(),
    date: fd.get('date') as string,
    vehicle_id: fd.get('vehicle_id') || null,
    driver_id: fd.get('driver_id') || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/expenses')
  redirect('/expenses')
}

export async function deleteExpense(id: string) {
  const ctx = await getFleetContext()
  if (!ctx) return
  await ctx.supabase.from('expenses').delete().eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId)
  revalidatePath('/expenses')
}
