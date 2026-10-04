import type { Metadata } from 'next'
import Link from 'next/link'
import { adminClient } from '@/lib/public-profile'
import { buildAll, leaderboard } from '@/lib/mmi-stats'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Leaderboard | MatchMyInterview',
  description: 'Top peer-rated members on MatchMyInterview. Scores come from real peer evaluations.',
}

export default async function LeaderboardPage() {
  let rows: Awaited<ReturnType<typeof leaderboard>> = []
  try {
    const admin = adminClient()
    if (admin) rows = leaderboard(await buildAll(admin), 20)
  } catch {}

  const muted: React.CSSProperties = { opacity: 0.65, fontSize: 13 }
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 64px' }}>
      <Link href="/" style={muted}>← Back to MatchMyInterview</Link>
      <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>Leaderboard</h1>
      <p style={muted}>
        Only members with a public profile and evaluations from at least 2 different peers appear here. Ranked by MMI score, then XP. Updated every few minutes.
      </p>
      {rows.length === 0 && (
        <div style={{ border: '1px solid rgba(128,128,128,.28)', borderRadius: 14, padding: 20, marginTop: 16 }}>
          Nobody qualifies yet. Complete sessions, get evaluated by 2 different peers, and make your profile public to appear.
        </div>
      )}
      {rows.map((r, i) => (
        <Link
          key={r.userId}
          href={'/u/' + r.username}
          style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(128,128,128,.28)', borderRadius: 14, padding: '14px 18px', marginTop: 12, textDecoration: 'none', color: 'inherit' }}
        >
          <span style={{ width: 28, fontWeight: 700 }}>{i + 1}</span>
          <span style={{ flex: 1 }}>
            <strong>{r.username}</strong>
            <span style={{ ...muted, display: 'block' }}>Level {r.level} · {r.distinctPeers} peers · {r.sessions} sessions</span>
          </span>
          <span style={{ fontSize: 22, fontWeight: 700 }}>{r.mmi}</span>
        </Link>
      ))}
    </main>
  )
}
