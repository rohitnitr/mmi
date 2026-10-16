import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { PRICE_PAISE, type TestRow, type TestState } from './shared'

export type Student = { full_name: string | null; phone: string | null; onboarded_at: string | null }

export async function getStudent(userId: string): Promise<Student | null> {
  const { data, error } = await getSupabaseAdmin().from('jee_students').select('full_name,phone,onboarded_at').eq('user_id', userId).maybeSingle()
  if (error) console.error('[jee] getStudent', error.message)
  return (data ?? null) as Student | null
}

// One row per LIVE test that has questions. Rule: each paid purchase gives one attempt.
// hasMock = the student may start or resume this test right now.
export async function loadStates(userId: string): Promise<TestState[]> {
  const admin = getSupabaseAdmin()
  const [t, p, a, res] = await Promise.all([
    admin
      .from('jee_tests')
      .select('id,title,kind,class_level,duration_minutes,category,sub_category,topic,pyq_year,pyq_date,pyq_shift,is_free,display_order,price_paise')
      .eq('status', 'live')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }),
    admin.from('jee_purchases').select('test_id,tier,attempts_granted').eq('user_id', userId).eq('status', 'paid'),
    admin.from('jee_attempts').select('test_id,status,started_at,attempt_number').eq('user_id', userId).order('started_at', { ascending: false }),
    admin.from('jee_results').select('test_id,marks').eq('user_id', userId).order('submitted_at', { ascending: false }),
  ])
  for (const q of [t, p, a, res]) if (q.error) console.error('[jee] loadStates', q.error.message)

  const liveRows = (t.data ?? []) as TestRow[]
  const qRes = liveRows.length
    ? await admin.from('jee_questions').select('test_id').in('test_id', liveRows.map((x) => x.id)).lte('position', 1)
    : { data: [] as { test_id: string }[], error: null }
  const hasQuestions = new Set(((qRes.data ?? []) as { test_id: string }[]).map((x) => x.test_id))

  const paid = (p.data ?? []) as { test_id: string; tier: string; attempts_granted: number | null }[]
  const attempts = (a.data ?? []) as { test_id: string; status: string; started_at: string; attempt_number?: number }[]
  const results = (res.data ?? []) as { test_id: string; marks: number }[]

  return liveRows.filter((x) => hasQuestions.has(x.id)).map((test) => {
    const isFree = Boolean(test.is_free)
    const mine = paid.filter((x) => x.test_id === test.id)
    const owns = mine.length > 0
    const hasAnalysis = isFree || mine.some((x) => x.tier === 'analysis')
    const atts = attempts.filter((x) => x.test_id === test.id) // newest first
    const available = mine.reduce((n, x) => n + (x.attempts_granted ?? 1), 0) - atts.length
    const attempt: TestState['attempt'] = atts.length === 0 ? 'none' : atts[0].status === 'in_progress' ? 'in_progress' : 'done'
    const hasMock = isFree || attempt === 'in_progress' || available > 0
    const mockPrice = test.price_paise && test.price_paise > 0 ? test.price_paise : PRICE_PAISE.mock
    const lastResult = results.find((r) => r.test_id === test.id)

    return {
      test,
      hasMock,
      hasAnalysis,
      attempt,
      canStart: attempt !== 'in_progress' && (isFree || available > 0),
      analysisPaise: hasAnalysis ? 0 : owns ? PRICE_PAISE.upgrade : mockPrice + PRICE_PAISE.upgrade,
      score: lastResult ? lastResult.marks : null,
    }
  })
}
