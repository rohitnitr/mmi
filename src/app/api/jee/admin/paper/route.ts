import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/jee/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { validatePaper } from '@/lib/jee/paper-validate'

export const dynamic = 'force-dynamic'

// GET: Fetch existing test as a complete JSON paper ready for editing in PaperBuilder
export async function GET(req: NextRequest) {
  const { ok } = await getAdmin()
  if (!ok) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const testId = searchParams.get('id')
  if (!testId) return NextResponse.json({ error: 'Missing test id.' }, { status: 400 })

  const admin = getSupabaseAdmin()
  const { data: test, error: tErr } = await admin
    .from('jee_tests')
    .select('id,title,kind,class_level,duration_minutes,status,category,sub_category,topic,display_order,price_paise,is_free')
    .eq('id', testId)
    .maybeSingle()

  if (tErr || !test) return NextResponse.json({ error: 'Test not found.' }, { status: 404 })

  const { data: questions, error: qErr } = await admin
    .from('jee_questions')
    .select('id,position,subject,chapter,topic,qtype,body,options,marks,negative,image_url')
    .eq('test_id', testId)
    .order('position', { ascending: true })

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 })

  const rawQuestions = (questions ?? []) as {
    id: string
    position: number
    subject: string
    chapter: string | null
    topic: string | null
    qtype: string
    body: string
    options: unknown
    marks: number
    negative: number
    image_url: string | null
  }[]

  const qIds = rawQuestions.map((q) => q.id)
  let keyMap = new Map<string, { correct: string; solution: string | null; tolerance: number | null }>()
  if (qIds.length > 0) {
    const { data: keys } = await admin
      .from('jee_answer_keys')
      .select('question_id,correct,solution,tolerance')
      .in('question_id', qIds)

    for (const k of (keys ?? []) as { question_id: string; correct: string; solution: string | null; tolerance: number | null }[]) {
      keyMap.set(k.question_id, k)
    }
  }

  const paperQuestions = rawQuestions.map((q) => {
    const key = keyMap.get(q.id)
    return {
      subject: q.subject,
      type: q.qtype,
      chapter: q.chapter,
      topic: q.topic,
      body: q.body,
      options: q.qtype === 'mcq' && Array.isArray(q.options) ? (q.options as string[]) : undefined,
      answer: key?.correct ?? '',
      solution: key?.solution ?? undefined,
      marks: q.marks,
      negative: q.negative,
      tolerance: key?.tolerance != null ? Number(key.tolerance) : undefined,
      image: q.image_url ?? undefined,
    }
  })

  return NextResponse.json({
    ok: true,
    test,
    paper: {
      test: {
        title: test.title,
        kind: test.kind,
        class_level: test.class_level,
        duration_minutes: test.duration_minutes,
        rights: 'original',
      },
      questions: paperQuestions,
    },
  })
}

// PUT: Update an existing test and its questions/answer keys
export async function PUT(req: NextRequest) {
  const { ok } = await getAdmin()
  if (!ok) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })

  let body: { testId?: string; paper?: unknown; status?: string } = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 }) }

  const testId = body.testId
  if (!testId) return NextResponse.json({ error: 'Missing testId.' }, { status: 400 })

  const res = validatePaper(body.paper)
  if (res.errors.length > 0) {
    return NextResponse.json({ error: 'Paper validation failed.', errors: res.errors }, { status: 422 })
  }
  const { test: testMeta, questions } = res.paper

  const admin = getSupabaseAdmin()
  const { data: existingTest, error: tErr } = await admin.from('jee_tests').select('id,status').eq('id', testId).maybeSingle()
  if (tErr || !existingTest) return NextResponse.json({ error: 'Test not found.' }, { status: 404 })

  // Update test metadata
  const upTest = await admin.from('jee_tests').update({
    title: testMeta.title,
    kind: testMeta.kind,
    duration_minutes: testMeta.duration_minutes,
    ...(testMeta.class_level ? { class_level: testMeta.class_level } : {}),
  }).eq('id', testId)

  if (upTest.error) return NextResponse.json({ error: upTest.error.message }, { status: 500 })

  // Check if students have already attempted this test
  const { count: attemptCount } = await admin.from('jee_attempts').select('id', { count: 'exact', head: true }).eq('test_id', testId)

  if (!attemptCount || attemptCount === 0) {
    // Clean replacement: safe to wipe old questions & re-insert
    await admin.from('jee_questions').delete().eq('test_id', testId)

    const ins = await admin.from('jee_questions').insert(questions.map((q, i) => ({
      test_id: testId,
      position: i + 1,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      qtype: q.type,
      body: q.body,
      options: q.type === 'mcq' ? q.options : null,
      marks: q.marks,
      negative: q.negative,
      image_url: q.image,
    }))).select('id,position')

    if (ins.error || !ins.data) {
      return NextResponse.json({ error: `Failed to save questions: ${ins.error?.message}` }, { status: 500 })
    }

    const idAt = new Map<number, string>()
    for (const r of ins.data as { id: string; position: number }[]) idAt.set(r.position, r.id)

    const keys = await admin.from('jee_answer_keys').insert(questions.map((q, i) => ({
      question_id: idAt.get(i + 1),
      correct: q.answer,
      solution: q.solution,
      tolerance: q.tolerance,
    })))

    if (keys.error) {
      return NextResponse.json({ error: `Failed to save answer keys: ${keys.error.message}` }, { status: 500 })
    }
  } else {
    // Attempts exist: update existing questions by position to preserve attempt answer linkages
    const { data: curQuestions } = await admin.from('jee_questions').select('id,position').eq('test_id', testId).order('position')
    const curList = (curQuestions ?? []) as { id: string; position: number }[]
    const curMap = new Map(curList.map((q) => [q.position, q.id]))

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const pos = i + 1
      const qId = curMap.get(pos)

      if (qId) {
        // Update question row
        await admin.from('jee_questions').update({
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic,
          qtype: q.type,
          body: q.body,
          options: q.type === 'mcq' ? q.options : null,
          marks: q.marks,
          negative: q.negative,
          image_url: q.image,
        }).eq('id', qId)

        // Update or insert answer key
        const { data: existingKey } = await admin.from('jee_answer_keys').select('question_id').eq('question_id', qId).maybeSingle()
        if (existingKey) {
          await admin.from('jee_answer_keys').update({
            correct: q.answer,
            solution: q.solution,
            tolerance: q.tolerance,
          }).eq('question_id', qId)
        } else {
          await admin.from('jee_answer_keys').insert({
            question_id: qId,
            correct: q.answer,
            solution: q.solution,
            tolerance: q.tolerance,
          })
        }
      } else {
        // New question added
        const ins = await admin.from('jee_questions').insert({
          test_id: testId,
          position: pos,
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic,
          qtype: q.type,
          body: q.body,
          options: q.type === 'mcq' ? q.options : null,
          marks: q.marks,
          negative: q.negative,
          image_url: q.image,
        }).select('id').single()

        if (ins.data?.id) {
          await admin.from('jee_answer_keys').insert({
            question_id: ins.data.id,
            correct: q.answer,
            solution: q.solution,
            tolerance: q.tolerance,
          })
        }
      }
    }
  }

  return NextResponse.json({ ok: true, testId, questions: questions.length, warnings: res.warnings })
}
