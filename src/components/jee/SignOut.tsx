'use client'

import { getClient } from '@/lib/supabase/client'

export default function SignOut() {
  async function out() {
    try { await getClient()?.auth.signOut() } catch { /* ignore, we leave anyway */ }
    window.location.href = '/jee'
  }
  return <button type="button" className="jx-ghost" onClick={out}>Sign out</button>
}
