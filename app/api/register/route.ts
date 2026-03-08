import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const body = await request.json()
  const { full_name, email, password, company_name, phone, address } = body

  if (!full_name || !email || !password || !company_name || !phone) {
    return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 })
  }

  const supabase = await createClient()

  // Check email not already taken
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  // Create user
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({ email: email.trim().toLowerCase(), password_hash, full_name })
    .select()
    .single()

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 })
  }

  // Assign fleet_owner role
  const { data: roleRow } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'fleet_owner')
    .single()

  if (roleRow) {
    await supabase.from('user_roles').insert({ user_id: newUser.id, role_id: roleRow.id })
  }

  // Create fleet_owners record (status pending until admin approves)
  const { data: fleetOwner, error: foError } = await supabase
    .from('fleet_owners')
    .insert({ user_id: newUser.id, company_name, phone, address: address || null, status: 'pending' })
    .select()
    .single()

  if (foError) {
    await supabase.from('users').delete().eq('id', newUser.id)
    return NextResponse.json({ error: foError.message }, { status: 400 })
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: newUser.id, email: newUser.email, full_name, role: 'fleet_owner', fleet_owner_id: fleetOwner.id })

  if (profileError) {
    await supabase.from('users').delete().eq('id', newUser.id)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
