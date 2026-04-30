/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Window-cached singleton — survives React re-renders, persists session across refreshes.
// Uses Supabase's default localStorage key (sb-{ref}-auth-token).
// Do NOT set a custom storageKey — sessions stored under different keys are lost on refresh.
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
        },
      }
    )
  }
  return w.__mmiSupabase
}
