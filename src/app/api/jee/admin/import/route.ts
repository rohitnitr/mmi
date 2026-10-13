import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/jee/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { validatePaper } from '@/lib/jee/paper-validate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Saves a checked paper as a DRAFT test. Nothing is visible to students until it is published.
export async function POST(req: NextRequest) {
  const { ok } = await getAdmin()
  if (!ok) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })
  let body: { paper?: unknown } = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }

  const res = validatePaper(body.paper)
  if (res.errors.length > 0) return NextResponse.json({ error: 'The paper has errors.', errors: res.errors }, { status: 422 })
  const { test, questions } = res.paper

  const admin = getSupabaseAdmin()
  const same = await admin.from('jee_tests').select('id').eq('title', test.title).limit(1)
  if (same.error) return NextResponse.json({ error: same.error.message }, { status: 500 })
  if ((same.data ?? []).length > 0) return NextResponse.json({ error: `A test called "${test.title}" already exists. Change the title.` }, { status: 409 })

  const t = await admin.from('jee_tests').insert({ title: test.title, kind: test.kind, ...(test.class_level ? { class_level: test.class_level } : {}), duration_minutes: test.duration_minutes, status: 'draft' }).select('id').single()
  if (t.error || !t.data) return NextResponse.json({ error: t.error?.message ?? 'Could not create the test.' }, { status: 500 })
  const testId = (t.data as { id: string }).id

  const rollback = async (msg: string) => {
    await admin.from('jee_tests').delete().eq('id', testId) // cascade removes partial questions
    return NextResponse.json({ error: `Import failed and was rolled back. ${msg}` }, { status: 500 })
  }
  const ins = await admin.from('jee_questions').insert(questions.map((q, i) => ({
    test_id: testId, position: i + 1, subject: q.subject, chapter: q.chapter, topic: q.topic, qtype: q.type, body: q.body,
    options: q.type === 'mcq' ? q.options : null, marks: q.marks, negative: q.negative, image_url: q.image,
  }))).select('id,position')
  if (ins.error || !ins.data) return rollback(ins.error?.message ?? '')
  const idAt = new Map<number, string>()
  for (const r of ins.data as { id: string; position: number }[]) idAt.set(r.position, r.id)

  const keys = await admin.from('jee_answer_keys').insert(questions.map((q, i) => ({ question_id: idAt.get(i + 1), correct: q.answer, solution: q.solution, tolerance: q.tolerance })))
  if (keys.error) return rollback(keys.error.message)

  return NextResponse.json({ ok: true, id: testId, questions: questions.length, warnings: res.warnings })
}
