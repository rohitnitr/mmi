import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { PRICE_PAISE, type TestRow, type TestState } from './shared'

export type Student = { full_name: string | null; phone: string | null; onboarded_at: string | null }

export async function getStudent(userId: string): Promise<Student | null> {
  const { data, error } = await getSupabaseAdmin().from('jee_students').select('full_name,phone,onboarded_at').eq('user_id', userId).maybeSingle()
  if (error) console.error('[jee] getStudent', error.message)
  return (data ?? null) as Student | null
}

// One row per live test, with what this student owns and whether the attempt is finished.
// Rule: paying unlocks the test. Free tests are accessible directly. Completed tests can be retaken with "Buy Again".
export async function loadStates(userId: string): Promise<TestState[]> {
  const admin = getSupabaseAdmin()
  const [t, p, a, res] = await Promise.all([
    admin
      .from('jee_tests')
      .select('id,title,kind,class_level,duration_minutes,category,sub_category,topic,pyq_year,pyq_date,pyq_shift,is_free,display_order,price_paise')
      .eq('status', 'live')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }),
    admin.from('jee_purchases').select('test_id,tier').eq('user_id', userId).eq('status', 'paid'),
    admin.from('jee_attempts').select('test_id,status,started_at,attempt_number').eq('user_id', userId).order('started_at', { ascending: false }),
    admin.from('jee_results').select('test_id,marks').eq('user_id', userId).order('submitted_at', { ascending: false }),
  ])
  for (const q of [t, p, a, res]) if (q.error) console.error('[jee] loadStates', q.error.message)

  const paid = (p.data ?? []) as { test_id: string; tier: string }[]
  const attempts = (a.data ?? []) as { test_id: string; status: string; started_at: string; attempt_number?: number }[]
  const results = (res.data ?? []) as { test_id: string; marks: number }[]

  // Only tests that are live AND actually contain questions are shown, so nobody can buy an empty exam.
  const liveRows = (t.data ?? []) as TestRow[]
  const qRes = liveRows.length
    ? await admin.from('jee_questions').select('test_id').in('test_id', liveRows.map((x) => x.id)).lte('position', 1)
    : { data: [] as { test_id: string }[], error: null }
  const hasQuestions = new Set(((qRes.data ?? []) as { test_id: string }[]).map((x) => x.test_id))

  return liveRows.filter((x) => hasQuestions.has(x.id)).map((test) => {
    const isFree = Boolean(test.is_free)
    const hasAnalysis = isFree || paid.some((x) => x.test_id === test.id && x.tier === 'analysis')
    const hasMock = isFree || hasAnalysis || paid.some((x) => x.test_id === test.id && x.tier === 'mock')
    const att = attempts.find((x) => x.test_id === test.id) // latest because of order('started_at', { ascending: false })
    const attempt: TestState['attempt'] = !att ? 'none' : att.status === 'in_progress' ? 'in_progress' : 'done'
    const lastResult = results.find((r) => r.test_id === test.id)

    return {
      test,
      hasMock,
      hasAnalysis,
      attempt,
      canStart: isFree ? attempt !== 'in_progress' : (hasMock && attempt !== 'done'),
      analysisPaise: hasAnalysis ? 0 : hasMock ? PRICE_PAISE.upgrade : (test.price_paise ? test.price_paise + 3800 : PRICE_PAISE.analysis),
      score: lastResult ? lastResult.marks : null,
    }
  })
}
