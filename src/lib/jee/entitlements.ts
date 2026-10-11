import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { PRICE_PAISE, type TestRow, type TestState } from './shared'

export type Student = { full_name: string | null; phone: string | null; onboarded_at: string | null }

export async function getStudent(userId: string): Promise<Student | null> {
  const { data, error } = await getSupabaseAdmin().from('jee_students').select('full_name,phone,onboarded_at').eq('user_id', userId).maybeSingle()
  if (error) console.error('[jee] getStudent', error.message)
  return (data ?? null) as Student | null
}

// One row per live test, with what this student owns and whether the attempt is finished.
// Rule: paying unlocks the test once. After the attempt is submitted (or expires) the test locks again.
export async function loadStates(userId: string): Promise<TestState[]> {
  const admin = getSupabaseAdmin()
  const [t, p, a] = await Promise.all([
    admin.from('jee_tests').select('id,title,kind,class_level,duration_minutes').eq('status', 'live').order('created_at', { ascending: false }),
    admin.from('jee_purchases').select('test_id,tier').eq('user_id', userId).eq('status', 'paid'),
    admin.from('jee_attempts').select('test_id,status').eq('user_id', userId),
  ])
  for (const q of [t, p, a]) if (q.error) console.error('[jee] loadStates', q.error.message)

  const paid = (p.data ?? []) as { test_id: string; tier: string }[]
  const attempts = (a.data ?? []) as { test_id: string; status: string }[]

  return ((t.data ?? []) as TestRow[]).map((test) => {
    const hasAnalysis = paid.some((x) => x.test_id === test.id && x.tier === 'analysis')
    const hasMock = hasAnalysis || paid.some((x) => x.test_id === test.id && x.tier === 'mock')
    const att = attempts.find((x) => x.test_id === test.id)
    const attempt: TestState['attempt'] = !att ? 'none' : att.status === 'in_progress' ? 'in_progress' : 'done'
    return {
      test, hasMock, hasAnalysis, attempt,
      canStart: hasMock && attempt !== 'done',
      analysisPaise: hasAnalysis ? 0 : hasMock ? PRICE_PAISE.upgrade : PRICE_PAISE.analysis,
    }
  })
}
