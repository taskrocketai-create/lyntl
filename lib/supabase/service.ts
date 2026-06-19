import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS
// ONLY use in server-side API routes, never expose to client
// Note: typed as any to avoid Supabase generic inference issues with insert operations
// All data is validated at the application layer before insert
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
