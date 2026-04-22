import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use anon key for client-side as it is restricted by RLS
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
