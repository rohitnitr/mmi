import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/jee/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getStudent, loadStates } from '@/lib/jee/entitlements'
import SignOut from '@/components/jee/SignOut'
import '@/components/jee/jee.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My JEE dashboard | MatchMyInterview', robots: { index: false, follow: false } }

const TOTAL = 300 // full JEE Main paper is out of 300

type Result = { test_id: string; marks: number; submitted_at: string }
type Rank = { test_id: string; rank: number; attempts: number; percentile: number }

export default async function Dashboard() {
  const user = await currentUser()
  if (!user) redirect('/jee')
  const student = await getStudent(user.id)
  if (!student?.onboarded_at) redirect('/jee/onboarding')

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const photo = typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : ''
  const fullName = student.full_name ?? ''
  const first = fullName.trim().split(' ')[0] || 'there'

  const admin = getSupabaseAdmin()
  const [states, resQ, rankQ] = await Promise.all([
    loadStates(user.id),
    admin.from('jee_results').select('test_id,marks,submitted_at').eq('user_id', user.id).order('submitted_at', { ascending: false }),
    admin.from('jee_rankings').select('test_id,rank,attempts,percentile').eq('user_id', user.id),
  ])
  for (const q of [resQ, rankQ]) if (q.error) console.error('[jee dashboard]', q.error.message)

  const results: Result[] = (resQ.data ?? []) as Result[]
  const ranks = new Map<string, Rank>()
  for (const r of (rankQ.data ?? []) as Rank[]) ranks.set(r.test_id, r)

  const titles = new Map<string, string>()
  const ids = Array.from(new Set(results.map((r) => r.test_id)))
  if (ids.length > 0) {
    const { data: titleRows } = await admin.from('jee_tests').select('id,title').in('id', ids)
    for (const t of (titleRows ?? []) as { id: string; title: string }[]) titles.set(t.id, t.title)
  }

  const mine = states.filter((s) => s.hasMock || s.hasAnalysis)
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
        <div className="jx-navr"><a href="/jee/store" className="jx-navlink">Store</a><SignOut /></div>
      </header>

      <main className="jx-sec" style={{ minHeight: '100vh' }}><div className="jx-wrap">
        <div className="jd-top">
          {photo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={photo} alt="" referrerPolicy="no-referrer" width={64} height={64} className="jd-av" />
            : <div className="jd-av jd-ini" aria-hidden="true">{(fullName || user.email || '?').slice(0, 1).toUpperCase()}</div>}
          <div>
            <h1 className="jd-h1">Hi, {first}</h1>
            <p className="jx-small" style={{ margin: 0 }}>{user.email}</p>
          </div>
        </div>

        <div className="jd-tiles">{tiles.map(([k, v]) => <div className="jd-tile" key={k}><span>{k}</span><b>{v}</b></div>)}</div>

        <h2 className="jd-h2">My mocks</h2>
        {mine.length === 0 ? (
          <div className="jd-empty"><b>You have not bought a mock yet.</b><p>Pick one in the store. Mocks start at {'\u20b9'}11.</p><p><a className="jx-cta" href="/jee/store" style={{ marginTop: 10 }}>Go to the store</a></p></div>
        ) : (
          <div className="jd-list">{mine.map((s) => {
            const done = s.attempt === 'done'
            return (
              <div className="jd-row" key={s.test.id}>
                <div><b>{s.test.title}</b><p>{s.test.duration_minutes} min · {done ? 'Completed' : s.attempt === 'in_progress' ? 'In progress' : 'Unlocked'}{s.hasAnalysis ? ' · Full analysis' : ''}</p></div>
                {done
                  ? (s.hasAnalysis ? <a className="jx-cta" href={`/jee/test/${s.test.id}`}>View analysis</a> : <a className="jx-cta alt" href="/jee/store">Add analysis</a>)
                  : <a className="jx-cta" href={`/jee/test/${s.test.id}`}>{s.attempt === 'in_progress' ? 'Resume test' : 'Start test'}</a>}
              </div>
            )
          })}</div>
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
