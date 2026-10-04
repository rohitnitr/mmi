import { ImageResponse } from 'next/og'
import { getPublicUser } from '@/lib/public-profile'
import { getPeerFeedback } from '@/lib/peer-feedback'

export const alt = 'MatchMyInterview portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  let title = 'MatchMyInterview'
  let stat = 'Peer mock interviews'
  try {
    const pub = await getPublicUser(username)
    if (pub) {
      title = decodeURIComponent(username)
      const fb = await getPeerFeedback(pub.admin, pub.id)
      if (fb.evaluationCount > 0) {
        const overall = fb.dimensions.find(d => d.key === 'overall')
        stat = (overall ? overall.avg.toFixed(1) + ' / 5 overall' : 'Peer-rated') + ' · ' + fb.evaluationCount + ' peer evaluation' + (fb.evaluationCount === 1 ? '' : 's')
      } else {
        stat = 'Peer-rated interview portfolio'
      }
    }
  } catch {}

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#0f172a', color: 'white' }}>
        <div style={{ display: 'flex', fontSize: 30, color: '#4ade80' }}>MatchMyInterview</div>
        <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, marginTop: 24 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 38, marginTop: 24, color: '#cbd5e1' }}>{stat}</div>
      </div>
    ),
    size
  )
}
