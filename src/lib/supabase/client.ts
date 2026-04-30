/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Window-cached singleton — survives React re-renders, persists session across refreshes.
// Using plain supabase-js with localStorage: OTP verifyOtp writes the session here directly.
// The middleware handles server-side cookie refresh independently.
export function createClient(): any {
  if (typeof window === 'undefined') return null

  const w = window as any
  if (!w.__mmiSupabase) {
    w.__mmiSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'mmi-auth',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      }
    )
  }
  return w.__mmiSupabase
}
