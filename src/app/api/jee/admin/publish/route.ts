import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/jee/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { validatePaper } from '@/lib/jee/paper-validate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Key = { correct: string; solution: string | null; tolerance: number }

// Moves a test between draft, live and closed. Going live re-checks the saved paper first.
export async function POST(req: NextRequest) {
  const { ok } = await getAdmin()
  if (!ok) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })
  let b: { testId?: unknown; status?: unknown } = {}
  try { b = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const testId = typeof b.testId === 'string' ? b.testId : ''
  const status = b.status === 'live' || b.status === 'draft' || b.status === 'closed' ? b.status : null
  if (!testId || !status) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const admin = getSupabaseAdmin()
  if (status === 'live') {
    const [t, q] = await Promise.all([
      admin.from('jee_tests').select('title,kind,class_level,duration_minutes').eq('id', testId).maybeSingle(),
      admin.from('jee_questions').select('id,position,subject,chapter,topic,qtype,body,options,marks,negative,image_url').eq('test_id', testId).order('position', { ascending: true }),
    ])
    if (!t.data) return NextResponse.json({ error: 'Test not found.' }, { status: 404 })
    const qs = (q.data ?? []) as { id: string; subject: string; chapter: string | null; topic: string | null; qtype: string; body: string; options: unknown; marks: number; negative: number; image_url: string | null }[]
    const keyOf = new Map<string, Key>()
    if (qs.length > 0) {
      const k = await admin.from('jee_answer_keys').select('question_id,correct,solution,tolerance').in('question_id', qs.map((x) => x.id))
      for (const r of (k.data ?? []) as (Key & { question_id: string })[]) keyOf.set(r.question_id, r)
    }
    const missing = qs.filter((x) => !keyOf.has(x.id)).length
    const tt = t.data as { title: string; kind: string; class_level: number | null; duration_minutes: number }
    const res = validatePaper({
      test: { ...tt, rights: 'original' }, // rights were declared at import
      questions: qs.map((x) => ({ subject: x.subject, chapter: x.chapter, topic: x.topic, type: x.qtype, body: x.body, options: x.options, answer: keyOf.get(x.id)?.correct ?? '', solution: keyOf.get(x.id)?.solution, marks: x.marks, negative: x.negative, tolerance: Number(keyOf.get(x.id)?.tolerance ?? 0), image: x.image_url })),
    })
    const problems = [...(missing ? [`${missing} question(s) have no answer key.`] : []), ...res.errors]
    if (problems.length > 0) return NextResponse.json({ error: 'This paper is not ready to publish.', errors: problems }, { status: 422 })
  }
  const up = await admin.from('jee_tests').update({ status }).eq('id', testId)
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 })
  return NextResponse.json({ ok: true, status })
}
