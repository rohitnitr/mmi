import { createClient } from '@/lib/supabase/server'

export async function currentUser() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  return user
}
