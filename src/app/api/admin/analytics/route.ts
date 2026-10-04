import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/public-profile'

export const dynamic = 'force-dynamic'

// Founder analytics. Only emails listed in the ADMIN_EMAILS env var (comma separated) may read it.
export async function GET(req: NextRequest) {
  const admin = adminClient()
  if (!admin) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 })
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })
  const { data: auth, error: authErr } = await admin.auth.getUser(token)
  const email = String(auth?.user?.email || '').toLowerCase()
  const admins = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  if (authErr || !email || !admins.includes(email)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 })

  const since = new Date(Date.now() - 7 * 86400000).toISOString()
  const count = async (table: string, col?: string) => {
    let q = admin.from(table).select('id', { count: 'exact', head: true })
    if (col) q = q.gte(col, since)
    const { count: c } = await q
    return c ?? 0
  }

  try {
    const [users, activeUsers7d, sessions, sessions7d, evaluations, evaluations7d, evRows, profiles] = await Promise.all([
      count('users'),
      count('users', 'last_active'),
      count('sessions'),
      count('sessions', 'start_time'),
      count('session_evaluations'),
      count('session_evaluations', 'created_at'),
      admin.from('session_evaluations').select('evaluatee_id, overall').range(0, 9999),
      admin.from('profiles').select('*').range(0, 9999),
    ])
    const rows: any[] = evRows.data ?? []
    const evaluated = new Set(rows.map(r => r.evaluatee_id)).size
    const avg = rows.length ? Math.round((rows.reduce((s, r) => s + Number(r.overall || 0), 0) / rows.length) * 10) / 10 : null
    const publicProfiles = ((profiles.data ?? []) as any[]).filter(p => p.is_public === true).length
    return NextResponse.json({
      users, activeUsers7d, sessions, sessions7d, evaluations, evaluations7d,
      evaluationRate: sessions > 0 ? Math.round((evaluations / sessions) * 100) : null,
      usersEvaluated: evaluated, publicProfiles, avgOverall: avg,
    })
  } catch {
    return NextResponse.json({ error: 'Could not load analytics.' }, { status: 500 })
  }
}
