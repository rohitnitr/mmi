// Server-only helpers for the evaluation API routes.
import type { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

/** Verifies the Supabase access token sent as "Authorization: Bearer <token>". */
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return null
  const db = getSupabaseAdmin()
  const { data, error } = await db.auth.getUser(token)
  if (error || !data.user) return null
  return data.user.id
}

/**
 * Names of the skills a user has declared on their profile.
 * Written to tolerate different column names in user_skills / skills.
 */
export async function getDeclaredSkills(userId: string): Promise<string[]> {
  const db = getSupabaseAdmin()
  const { data: rowData } = await db.from('user_skills').select('*').eq('user_id', userId)
  const rows = (rowData ?? []) as Record<string, unknown>[]
  if (rows.length === 0) return []

  const names = new Set<string>()
  const ids: string[] = []
  for (const row of rows) {
    const direct = row.skill_name ?? row.name ?? row.skill
    if (typeof direct === 'string' && direct.trim()) names.add(direct.trim())
    else if (row.skill_id != null) ids.push(String(row.skill_id))
  }
  if (ids.length > 0) {
    const { data: skills } = await db.from('skills').select('*').in('id', ids)
    for (const s of (skills ?? []) as Record<string, unknown>[]) {
      const n = s.name ?? s.label ?? s.title
      if (typeof n === 'string' && n.trim()) names.add(n.trim())
    }
  }
  return Array.from(names).slice(0, 25)
}
