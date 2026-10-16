'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export const COOKIE_KEY = 'mmi-cookie-consent'

export type CookieChoice = 'all' | 'essential'

function loadAnalytics() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('mmi-consent-analytics'))
}

export function CookieConsent() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(COOKIE_KEY)
    if (stored === 'all') loadAnalytics()
    if (!stored) setOpen(true)
  }, [])

  const choose = (choice: CookieChoice) => {
    window.localStorage.setItem(COOKIE_KEY, choice)
    if (choice === 'all') loadAnalytics()
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="mmi-cookie" role="dialog" aria-labelledby="mmi-cookie-title" aria-live="polite">
      <div className="mmi-cookie-inner">
        <div>
          <p id="mmi-cookie-title" className="mmi-cookie-title">Cookies and privacy</p>
          <p className="mmi-cookie-copy">
            We use essential cookies to keep you signed in. Analytics cookies help us improve the product.
            Advertising cookies (including Google AdSense, if enabled) are used only after you accept.
            Read the <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link>.
          </p>
        </div>
        <div className="mmi-cookie-actions">
          <button type="button" className="mmi-cookie-btn ghost" onClick={() => choose('essential')}>
            Essential only
          </button>
          <button type="button" className="mmi-cookie-btn" onClick={() => choose('all')}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
