'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'super_admin') return null
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
