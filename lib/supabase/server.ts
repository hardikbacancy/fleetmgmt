import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Use the service role key so all DB queries run with full access.
// Auth/authorization is enforced in the application layer (session cookie + server actions).
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
