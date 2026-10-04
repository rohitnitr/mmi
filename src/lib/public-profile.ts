import { createClient } from '@supabase/supabase-js'

// Server-only. Returns the user id only if that user's profile is public.
export function adminClient(): any | null {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!u || !k) return null
  return createClient(u, k, { auth: { persistSession: false } })
}

export async function getPublicUser(username: string): Promise<{ id: string; admin: any } | null> {
  try {
    const admin = adminClient()
    if (!admin) return null
    const { data: user } = await admin.from('users').select('id').eq('username', decodeURIComponent(username)).maybeSingle()
    if (!user) return null
    for (const col of ['id', 'user_id']) {
      const r = await admin.from('profiles').select('*').eq(col, user.id).maybeSingle()
      if (!r.error) return r.data && r.data.is_public === true ? { id: user.id, admin } : null
    }
    return null
  } catch {
    return null
  }
}
