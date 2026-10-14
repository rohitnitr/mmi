import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requireAdminPage } from '@/lib/jee/admin'
import PaperBuilder, { type TestRowInfo } from '@/components/jee/PaperBuilder'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Paper builder | MatchMyInterview JEE', robots: { index: false, follow: false } }

export default async function PapersAdmin() {
  const { ok } = await requireAdminPage()
  if (!ok) {
    return (
      <main style={{ maxWidth: 560, margin: '80px auto', padding: 20, fontFamily: 'system-ui,sans-serif' }}>
        <h1>Admins only</h1>
        <p>This page is for the site owner. To get access, add your Google email to <code>JEE_ADMIN_EMAILS</code> in <code>.env.local</code> and in Vercel, then redeploy.</p>
        <p><a href="/jee/dashboard">Back to dashboard</a></p>
      </main>
    )
  }

  const admin = getSupabaseAdmin()
  const [t, q, p, a] = await Promise.all([
    admin.from('jee_tests').select('id,title,kind,status,duration_minutes,category,display_order,created_at').order('display_order', { ascending: true }).order('created_at', { ascending: false }),
    admin.from('jee_questions').select('test_id'),
    admin.from('jee_purchases').select('test_id').eq('status', 'paid'),
    admin.from('jee_attempts').select('test_id'),
  ])
  const tally = (rows: { test_id: string }[] | null) => { const m = new Map<string, number>(); for (const r of rows ?? []) m.set(r.test_id, (m.get(r.test_id) ?? 0) + 1); return m }
  const qn = tally(q.data as { test_id: string }[] | null), pn = tally(p.data as { test_id: string }[] | null), an = tally(a.data as { test_id: string }[] | null)
  const tests: TestRowInfo[] = ((t.data ?? []) as { id: string; title: string; kind: string; status: string; duration_minutes: number; category?: string; display_order?: number }[]).map((x) => ({
    id: x.id, title: x.title, kind: x.kind, status: x.status, minutes: x.duration_minutes, questions: qn.get(x.id) ?? 0, purchases: pn.get(x.id) ?? 0, attempts: an.get(x.id) ?? 0, category: x.category, display_order: x.display_order,
  }))
  return <PaperBuilder tests={tests} />
}
