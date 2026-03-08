'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActionState } from '@/lib/types'

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: 'Invalid email or password. Please try again.' }

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role

  if (role === 'super_admin') redirect('/admin')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
