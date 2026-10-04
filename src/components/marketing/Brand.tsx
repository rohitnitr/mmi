'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LOGO_SRC } from './logo'

export function Logo({ light = false }: { light?: boolean }) {
  const [bad, setBad] = useState(false)
  return (
    <Link href="/" className="mh-logo" style={light ? { color: '#fff' } : undefined} aria-label="MatchMyInterview home">
      {LOGO_SRC && !bad ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="mh-logo-img" src={LOGO_SRC} alt="" width={32} height={32} onError={() => setBad(true)} />
      ) : (
        <span className="mh-logo-mark">M</span>
      )}
      <span>MatchMyInterview</span>
    </Link>
  )
}
