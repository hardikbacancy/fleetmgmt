import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { full_name, email, password, company_name, phone, address } = body

  if (!full_name || !email || !password || !company_name || !phone) {
    return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create auth user (email confirmed, no verification email)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'fleet_owner', full_name },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const userId = authData.user.id

  // Create fleet_owners record (status pending until admin approves)
  const { data: fleetOwner, error: foError } = await supabase
    .from('fleet_owners')
    .insert({ user_id: userId, company_name, phone, address: address || null, status: 'pending' })
    .select()
    .single()

  if (foError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: foError.message }, { status: 400 })
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: userId, email, full_name, role: 'fleet_owner', fleet_owner_id: fleetOwner.id })

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
