import type { Metadata } from 'next'
import Link from 'next/link'
import { adminClient } from '@/lib/public-profile'
import { getTalent, type Talent } from '@/lib/talent'

export const metadata: Metadata = {
  title: 'Talent | MatchMyInterview',
  description: 'Discover members whose interview skills have been rated by real peers on MatchMyInterview.',
}

type SP = { q?: string; domain?: string; skill?: string }

export default async function TalentPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  let items: Talent[] = []
  let total = 0
  let domains: string[] = []
  try {
    const admin = adminClient()
    if (admin) {
      const r = await getTalent(admin, { q: sp.q, domain: sp.domain, skill: sp.skill, limit: 60 })
      items = r.items
      total = r.total
      domains = r.domains
    }
  } catch {}

  const muted: React.CSSProperties = { opacity: 0.65, fontSize: 13 }
  const input: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(128,128,128,.4)', background: 'transparent', color: 'inherit', fontSize: 14 }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 64px' }}>
      <Link href="/" style={muted}>← Back to MatchMyInterview</Link>
      <h1 style={{ fontSize: 28, margin: '12px 0 4px' }}>Talent</h1>
      <p style={muted}>
        Members who chose a public profile. Scores come from real peer evaluations. Anyone can opt in from their professional profile settings.
      </p>

      <form method="get" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
        <input name="q" defaultValue={sp.q || ''} placeholder="Search name, role, headline" style={{ ...input, flex: 1, minWidth: 200 }} />
        <select name="domain" defaultValue={sp.domain || ''} style={input}>
          <option value="">All domains</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input name="skill" defaultValue={sp.skill || ''} placeholder="Skill, e.g. SQL" style={{ ...input, width: 150 }} />
        <button type="submit" style={{ ...input, cursor: 'pointer' }}>Search</button>
      </form>

      <p style={muted}>{total} member{total === 1 ? '' : 's'}</p>

      {items.length === 0 && (
        <div style={{ border: '1px solid rgba(128,128,128,.28)', borderRadius: 14, padding: 20, marginTop: 12 }}>
          No public profiles match yet. Complete a mock interview, get evaluated by a peer, and make your profile public to be listed here.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, marginTop: 12 }}>
        {items.map(t => (
          <Link
            key={t.username}
            href={'/u/' + t.username}
            style={{ border: '1px solid rgba(128,128,128,.28)', borderRadius: 14, padding: 16, textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong>{t.username}</strong>
              <span style={{ fontWeight: 700 }}>{t.mmi === null ? '' : 'MMI ' + t.mmi}</span>
            </div>
            <div style={muted}>{[t.targetRole, t.domain].filter(Boolean).join(' · ') || 'Member'}</div>
            {t.headline && <p style={{ fontSize: 14, margin: '8px 0 0' }}>{t.headline.slice(0, 110)}</p>}
            <div style={{ ...muted, marginTop: 8 }}>
              {t.mmi === null
                ? 'Not yet peer-rated'
                : 'Level ' + t.level + ' · ' + t.peers + ' peer' + (t.peers === 1 ? '' : 's') + (t.provisional ? ' · provisional' : '')}
            </div>
            {t.topSkills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {t.topSkills.map(s => (
                  <span key={s.skill} style={{ border: '1px solid rgba(128,128,128,.4)', borderRadius: 99, padding: '2px 10px', fontSize: 12 }}>
                    {s.skill} {s.avg.toFixed(1)}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      <p style={{ ...muted, marginTop: 24 }}>
        <Link href="/leaderboard">Leaderboard</Link>
      </p>
    </main>
  )
}
