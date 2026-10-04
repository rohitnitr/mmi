import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const DIMS = ['communication', 'structure', 'knowledge', 'problem_solving', 'overall'] as const

// GET /api/evaluations/report          -> list of evaluations you received
// GET /api/evaluations/report?id=<id>  -> one full report (only if you are the evaluatee)
// The evaluator is never revealed.
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 })
  const admin: any = createClient(url, key, { auth: { persistSession: false } })

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })
  const { data: auth, error: authErr } = await admin.auth.getUser(token)
  const uid: string | undefined = authErr ? undefined : auth?.user?.id
  if (!uid) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    const { data, error } = await admin
      .from('session_evaluations')
      .select('id, created_at, overall, strengths')
      .eq('evaluatee_id', uid)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return NextResponse.json({ error: 'Could not load reports.' }, { status: 500 })
    return NextResponse.json({ items: data ?? [] })
  }

  const { data: ev, error: evErr } = await admin
    .from('session_evaluations')
    .select('id, created_at, communication, structure, knowledge, problem_solving, overall, strengths, improvements')
    .eq('id', id)
    .eq('evaluatee_id', uid)
    .maybeSingle()
  if (evErr) return NextResponse.json({ error: 'Could not load report.' }, { status: 500 })
  if (!ev) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })

  const [skillsRes, allRes, userRes] = await Promise.all([
    admin.from('evaluation_skill_ratings').select('skill, rating').eq('evaluation_id', id),
    admin
      .from('session_evaluations')
      .select('communication, structure, knowledge, problem_solving, overall')
      .eq('evaluatee_id', uid),
    admin.from('users').select('username').eq('id', uid).maybeSingle(),
  ])

  const all: any[] = allRes.data ?? []
  const averages: Record<string, number> = {}
  for (const d of DIMS) {
    averages[d] = all.length
      ? Math.round((all.reduce((s: number, e: any) => s + Number(e[d] ?? 0), 0) / all.length) * 10) / 10
      : 0
  }

  let isPublic = false
  for (const col of ['id', 'user_id']) {
    const r = await admin.from('profiles').select('*').eq(col, uid).maybeSingle()
    if (!r.error) {
      isPublic = r.data?.is_public === true
      break
    }
  }

  return NextResponse.json({
    evaluation: {
      id: ev.id,
      created_at: ev.created_at,
      scores: Object.fromEntries(DIMS.map(d => [d, ev[d]])),
      strengths: ev.strengths,
      improvements: ev.improvements,
    },
    skills: skillsRes.data ?? [],
    averages,
    count: all.length,
    username: userRes.data?.username ?? null,
    isPublic,
  })
}
