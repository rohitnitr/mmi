'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type T = { username: string; domain: string; targetRole: string; mmi: number | null; provisional: boolean; level: number; peers: number }

// Homepage section. Real data only: shows an honest empty state until members are peer-rated.
export default function HomeTalent() {
  const [items, setItems] = useState<T[] | null>(null)

  useEffect(() => {
    let on = true
    fetch('/api/talent?limit=6&rated=1')
      .then(r => r.json())
      .then(j => { if (on) setItems(j.items || []) })
      .catch(() => { if (on) setItems([]) })
    return () => { on = false }
  }, [])

  const muted: React.CSSProperties = { opacity: 0.65, fontSize: 14 }

  return (
    <section aria-labelledby="home-talent-title" style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 16px' }}>
      <h2 id="home-talent-title" style={{ fontSize: 28, margin: 0 }}>Top peer-rated members</h2>
      <p style={{ ...muted, margin: '6px 0 20px' }}>
        Skills and interview performance rated by real peers after mock interviews. Members opt in to be listed.
      </p>

      {items && items.length === 0 && (
        <div style={{ border: '1px solid rgba(128,128,128,.28)', borderRadius: 14, padding: 20 }}>
          No peer-rated profiles are public yet. Do a mock interview, get evaluated by a peer, and make your profile public to be among the first listed here.
        </div>
      )}

      {items && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {items.map(t => (
            <Link
              key={t.username}
              href={'/u/' + t.username}
              style={{ border: '1px solid rgba(128,128,128,.28)', borderRadius: 14, padding: 16, textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{t.username}</strong>
                <span style={{ fontWeight: 700 }}>MMI {t.mmi}</span>
              </div>
              <div style={muted}>{[t.targetRole, t.domain].filter(Boolean).join(' · ') || 'Member'}</div>
              <div style={{ ...muted, fontSize: 13, marginTop: 6 }}>
                Level {t.level} · {t.peers} peer{t.peers === 1 ? '' : 's'}{t.provisional ? ' · provisional' : ''}
              </div>
            </Link>
          ))}
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 14 }}>
        <Link href="/talent">Browse all talent →</Link> · <Link href="/leaderboard">Leaderboard</Link>
      </p>
    </section>
  )
}
