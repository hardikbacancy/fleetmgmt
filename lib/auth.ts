import { createClient } from './supabase/server'
import { getSession } from './session'

export async function getProfile() {
  const session = await getSession()
  if (!session) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, fleet_owners(*)')
    .eq('id', session.userId)
    .single()

  return profile
}

export async function getFleetContext() {
  const session = await getSession()
  if (!session || !session.fleetOwnerId) return null

  const supabase = await createClient()
  return { supabase, fleetOwnerId: session.fleetOwnerId, role: session.role }
}
