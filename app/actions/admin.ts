'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') return null
  const supabase = await createClient()
  return { supabase }
}

export async function updateFleetOwnerStatus(id: string, status: 'active' | 'inactive' | 'pending') {
  const ctx = await requireAdmin()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase
    .from('fleet_owners')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/fleet-owners')
  revalidatePath(`/admin/fleet-owners/${id}`)
}
