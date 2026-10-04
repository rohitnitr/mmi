import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUserId, getDeclaredSkills } from '@/lib/evaluations'
import { DIMENSIONS, MAX_SKILLS } from '@/lib/evaluation-config'

type EvalRow = {
  id: string; created_at: string
  communication: number; structure: number; knowledge: number; problem_solving: number; overall: number
  strengths: string | null; improvements: string | null
}
type SkillRow = { skill: string; rating_count: number; evaluator_count: number; avg_rating: number; is_validated: boolean }

const isScore = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

// Submit an evaluation for a session you took part in.
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  const rawScores = (body.scores ?? {}) as Record<string, unknown>
  if (!sessionId) return NextResponse.json({ error: 'Missing session.' }, { status: 400 })
  for (const d of DIMENSIONS) {
    if (!isScore(rawScores[d.key])) {
      return NextResponse.json({ error: `Rate "${d.label}" from 1 to 5.` }, { status: 400 })
    }
  }

  const db = getSupabaseAdmin()
  const { data: session } = await db
    .from('sessions')
    .select('id,user1_id,user2_id')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
  if (session.user1_id !== userId && session.user2_id !== userId) {
    return NextResponse.json({ error: 'You were not part of this session.' }, { status: 403 })
  }
  const evaluateeId: string = session.user1_id === userId ? session.user2_id : session.user1_id
  if (evaluateeId === userId) return NextResponse.json({ error: 'You cannot evaluate yourself.' }, { status: 400 })

  // Skill ratings: keep only skills the peer declared, one rating per skill.
  const declared = await getDeclaredSkills(evaluateeId)
  const declaredKeys = new Set(declared.map(s => s.toLowerCase()))
  const seen = new Set<string>()
  const skillInput = Array.isArray(body.skills) ? (body.skills as Record<string, unknown>[]) : []
  const skillRows: { skill: string; rating: number }[] = []
  for (const item of skillInput) {
    const skill = clean(item?.skill, 60)
    const rating = item?.rating
    const key = skill?.toLowerCase()
    if (!skill || !key || seen.has(key) || !isScore(rating)) continue
    if (declaredKeys.size > 0 && !declaredKeys.has(key)) continue
    seen.add(key)
    skillRows.push({ skill, rating })
    if (skillRows.length >= MAX_SKILLS) break
  }

  const { data: ev, error } = await db
    .from('session_evaluations')
    .insert({
      session_id: sessionId,
      evaluator_id: userId,
      evaluatee_id: evaluateeId,
      communication: rawScores.communication,
      structure: rawScores.structure,
      knowledge: rawScores.knowledge,
      problem_solving: rawScores.problem_solving,
      overall: rawScores.overall,
      strengths: clean(body.strengths, 1000),
      improvements: clean(body.improvements, 1000),
    })
    .select('id')
    .single()

  if (error || !ev) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'You already evaluated this session.' }, { status: 409 })
    }
    console.error('[evaluations] insert failed', error?.message)
    return NextResponse.json({ error: 'Could not save your evaluation. Please try again.' }, { status: 500 })
  }

  if (skillRows.length > 0) {
    const { error: skillErr } = await db.from('evaluation_skill_ratings').insert(
      skillRows.map((r: { skill: string; rating: number }) => ({ evaluation_id: ev.id, evaluatee_id: evaluateeId, evaluator_id: userId, skill: r.skill, rating: r.rating }))
    )
    if (skillErr) {
      console.error('[evaluations] skill insert failed', skillErr.message)
      await db.from('session_evaluations').delete().eq('id', ev.id) // keep it all-or-nothing
      return NextResponse.json({ error: 'Could not save your evaluation. Please try again.' }, { status: 500 })
    }
  }

  const { error: recomputeErr } = await db.rpc('recompute_skill_validations', { p_user: evaluateeId })
  if (recomputeErr) console.error('[evaluations] recompute failed', recomputeErr.message)

  return NextResponse.json({ success: true })
}

// Evaluations you received. The evaluator's identity is never returned.
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })

  const db = getSupabaseAdmin()
  const { data: evalData, error } = await db
    .from('session_evaluations')
    .select('id,created_at,communication,structure,knowledge,problem_solving,overall,strengths,improvements')
    .eq('evaluatee_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) {
    console.error('[evaluations] read failed', error.message)
    return NextResponse.json({ error: 'Could not load evaluations.' }, { status: 500 })
  }

  const list = (evalData ?? []) as EvalRow[]
  const averages = list.length
    ? Object.fromEntries(
        DIMENSIONS.map(d => [d.key, Math.round((list.reduce((sum: number, e: EvalRow) => sum + Number(e[d.key]), 0) / list.length) * 10) / 10])
      )
    : null

  const { data: skills } = await db
    .from('skill_validations')
    .select('skill,rating_count,evaluator_count,avg_rating,is_validated')
    .eq('evaluatee_id', userId)
    .order('avg_rating', { ascending: false })

  return NextResponse.json({
    count: list.length,
    averages,
    recent: list.slice(0, 10).map((e: EvalRow) => ({
      id: e.id, created_at: e.created_at, overall: e.overall, strengths: e.strengths, improvements: e.improvements,
    })),
    skills: (skills ?? []) as SkillRow[],
  })
}
