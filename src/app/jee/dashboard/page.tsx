import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import SignOut from '@/components/jee/SignOut'
import '@/components/jee/jee.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My JEE dashboard | MatchMyInterview', robots: { index: false, follow: false } }

const TOTAL = 300 // full JEE Main paper is out of 300. Part/sectional/chapter tests will need their own totals.
const KIND: Record<string, string> = { full: 'Full-length mock', part: 'Part test', sectional: 'Sectional test', chapter: 'Chapter test' }

type Test = { id: string; title: string; kind: string; class_level: number | null; duration_minutes: number }
type Result = { test_id: string; marks: number; submitted_at: string }
type Rank = { test_id: string; rank: number; attempts: number; percentile: number }

export default async function Dashboard() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/jee')

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const fullName = [meta.full_name, meta.name].find((v) => typeof v === 'string' && v.trim()) as string | undefined
  const photo = typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : ''
  const first = fullName?.trim().split(' ')[0] ?? 'there'

  const admin = getSupabaseAdmin()
  const [liveQ, resQ, rankQ] = await Promise.all([
    admin.from('jee_tests').select('id,title,kind,class_level,duration_minutes').eq('status', 'live').order('created_at', { ascending: false }),
    admin.from('jee_results').select('test_id,marks,submitted_at').eq('user_id', user.id).order('submitted_at', { ascending: false }),
    admin.from('jee_rankings').select('test_id,rank,attempts,percentile').eq('user_id', user.id),
  ])
  for (const q of [liveQ, resQ, rankQ]) if (q.error) console.error('[jee dashboard]', q.error.message)

  const live: Test[] = (liveQ.data ?? []) as Test[]
  const results: Result[] = (resQ.data ?? []) as Result[]

  const ranks = new Map<string, Rank>()
  for (const r of (rankQ.data ?? []) as Rank[]) ranks.set(r.test_id, r)

  const titles = new Map<string, string>()
  const ids = Array.from(new Set(results.map((r) => r.test_id)))
  if (ids.length > 0) {
    const { data: titleRows } = await admin.from('jee_tests').select('id,title').in('id', ids)
    for (const t of (titleRows ?? []) as { id: string; title: string }[]) titles.set(t.id, t.title)
  }

  const best = results.length ? Math.max(...results.map((r) => r.marks)) : null
  const latestRank = results[0] ? ranks.get(results[0].test_id) : undefined
  const bestPct = ranks.size ? Math.max(...Array.from(ranks.values()).map((r) => Number(r.percentile))) : null

  const tiles: [string, string][] = [
    ['Mocks attempted', String(results.length)],
    ['Best score', best === null ? '\u2014' : `${best}/${TOTAL}`],
    ['Latest rank', latestRank ? `#${latestRank.rank} of ${latestRank.attempts}` : '\u2014'],
    ['Best percentile', bestPct === null ? '\u2014' : bestPct.toFixed(2)],
  ]

  return (
    <div className="jx auto">
      <header className="jx-nav">
        <a href="/jee" className="jx-brand">MatchMyInterview <span>· JEE</span></a>
        <SignOut />
      </header>

      <main className="jx-sec" style={{ minHeight: '100vh' }}><div className="jx-wrap">
        <div className="jd-top">
          {photo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={photo} alt="" referrerPolicy="no-referrer" width={64} height={64} className="jd-av" />
            : <div className="jd-av jd-ini" aria-hidden="true">{(fullName ?? user.email ?? '?').slice(0, 1).toUpperCase()}</div>}
          <div>
            <h1 className="jd-h1">Hi, {first}</h1>
            <p className="jx-small" style={{ margin: 0 }}>{user.email}</p>
          </div>
        </div>

        <div className="jd-tiles">{tiles.map(([k, v]) => <div className="jd-tile" key={k}><span>{k}</span><b>{v}</b></div>)}</div>

        <h2 className="jd-h2">Mocks you can take</h2>
        {live.length === 0 ? (
          <div className="jd-empty"><b>No mocks are live yet.</b><p>The first mocks are being prepared. They will appear here as soon as they open.</p></div>
        ) : (
          <div className="jd-list">{live.map((t) => (
            <div className="jd-row" key={t.id}>
              <div><b>{t.title}</b><p>{KIND[t.kind] ?? t.kind}{t.class_level ? ` \u00b7 Class ${t.class_level}` : ''} \u00b7 {t.duration_minutes} min</p></div>
              <button type="button" className="jx-cta" disabled title="Taking mocks opens soon">Opens soon</button>
            </div>))}
          </div>
        )}

        <h2 className="jd-h2">Your attempts</h2>
        {results.length === 0 ? (
          <div className="jd-empty"><b>No attempts yet.</b><p>Your marks, rank and percentile for every mock will be listed here after you submit your first one.</p></div>
        ) : (
          <div className="jx-lb" style={{ paddingTop: 22 }}><table>
            <thead><tr><th>Mock</th><th>Marks</th><th>Rank</th><th>Percentile</th><th>Date</th></tr></thead>
            <tbody>{results.map((r) => {
              const k = ranks.get(r.test_id)
              return <tr key={r.test_id + r.submitted_at}>
                <td>{String(titles.get(r.test_id) ?? 'Mock')}</td><td>{r.marks}/{TOTAL}</td>
                <td>{k ? `#${k.rank} of ${k.attempts}` : '\u2014'}</td><td>{k ? Number(k.percentile).toFixed(2) : '\u2014'}</td>
                <td>{new Date(r.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            })}</tbody>
          </table></div>
        )}

        <h2 className="jd-h2">Study resources</h2>
        <div className="jd-empty"><b>Coming soon.</b><p>Revision notes, formula sheets and previous-year questions are being added.</p></div>
      </div></main>
    </div>
  )
}
