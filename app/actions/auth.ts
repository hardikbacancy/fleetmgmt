'use server'

import { createClient } from '@/lib/supabase/server'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { ActionState } from '@/lib/types'

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string

  const supabase = await createClient()

  // Verify credentials via DB function (uses pgcrypto crypt())
  const { data, error } = await supabase
    .rpc('authenticate_user', { p_email: email, p_password: password })

  console.error('[login] RPC error:', error)
  console.log('[login] RPC data:', data)

  if (error || !data || data.length === 0) {
    return { error: error?.message ?? 'Invalid email or password. Please try again.' }
  }

  const user = data[0]

  await createSession({
    userId: user.id,
    role: user.role,
    fleetOwnerId: user.fleet_owner_id ?? null,
  })

  if (user.role === 'super_admin') redirect('/admin')
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
