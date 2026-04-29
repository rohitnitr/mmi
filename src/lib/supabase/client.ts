/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserClient } from '@supabase/ssr'

// Window-cached singleton — survives React re-renders, persists session across refreshes
// Using createBrowserClient from @supabase/ssr for proper PKCE + cookie-based session support
export function createClient(): any {
  if (typeof window === 'undefined') return null

  const w = window as any
  if (!w.__mmiSupabase) {
    w.__mmiSupabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return w.__mmiSupabase
}
