import { createClient } from './supabase/server'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, fleet_owners(*)')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getFleetContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('fleet_owner_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.fleet_owner_id) return null
  return { supabase, fleetOwnerId: profile.fleet_owner_id, role: profile.role }
}
