import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Admins are the emails listed in JEE_ADMIN_EMAILS (comma separated). With the variable unset, nobody is an admin.
export async function getAdmin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  const list = (process.env.JEE_ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  const ok = !!user?.email && list.includes(user.email.toLowerCase())
  return { user, ok }
}
export async function requireAdminPage() {
  const a = await getAdmin()
  if (!a.user) redirect('/jee')
  return a
}
