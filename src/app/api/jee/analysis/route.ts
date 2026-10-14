import { NextRequest, NextResponse } from 'next/server'
import { adminDb, currentUser, getAttempt, getTest, loadQuestionsWithSolutions, paidTiers } from '@/lib/jee/exam-server'
import { computeComprehensiveAnalysis } from '@/lib/jee/analysis-engine'
import { generateAIAnalysis } from '@/lib/jee/ai-analysis'
import { UUID_RE, type KeyRow } from '@/lib/jee/exam-shared'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const testId = searchParams.get('testId')
  if (!testId || !UUID_RE.test(testId)) return NextResponse.json({ error: 'Invalid test id.' }, { status: 400 })

  const db = adminDb()
  const test = await getTest(db, testId)
  if (!test) return NextResponse.json({ error: 'Test not found.' }, { status: 404 })

  const attempt = await getAttempt(db, user.id, testId)
  if (!attempt || attempt.status === 'in_progress') {
    return NextResponse.json({ error: 'You have not submitted this mock test yet.' }, { status: 400 })
  }

  const [tiers, questions, { data: ansRows }, { data: rankRow }] = await Promise.all([
    paidTiers(db, user.id, testId),
    loadQuestionsWithSolutions(db, testId),
    db.from('jee_answers').select('question_id,response,state,time_spent_ms,bookmarked').eq('attempt_id', attempt.id),
    db.from('jee_rankings').select('rank,attempts,percentile').eq('test_id', testId).eq('user_id', user.id).maybeSingle(),
  ])

  const keys: KeyRow[] = questions.map((q) => ({
    question_id: q.id,
    correct: q.answer ?? '',
    tolerance: q.tolerance ?? null,
  }))

  const analysis = computeComprehensiveAnalysis({
    questions,
    keys,
    answers: (ansRows ?? []).map((r) => ({
      question_id: r.question_id,
      response: r.response,
      state: r.state,
      time_spent_ms: r.time_spent_ms,
      bookmarked: r.bookmarked,
    })),
    rank: rankRow as { rank: number; attempts: number; percentile: number } | null,
  })

  const aiReport = await generateAIAnalysis(analysis, test.title)

  return NextResponse.json({
    ok: true,
    hasAnalysis: tiers.analysis,
    analysis,
    aiReport,
  })
}
