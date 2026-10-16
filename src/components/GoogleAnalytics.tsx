'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { COOKIE_KEY } from '@/components/CookieConsent'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: Record<string, unknown>[]
  }
}

function AnalyticsEvents({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && window.gtag) {
      const url =
        pathname +
        (searchParams && searchParams.toString() ? `?${searchParams.toString()}` : '')
      window.gtag('config', measurementId, { page_path: url })
    }
  }, [pathname, searchParams, measurementId])

  return null
}

export function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const sync = () => {
      setAllowed(window.localStorage.getItem(COOKIE_KEY) === 'all')
    }
    sync()
    window.addEventListener('mmi-consent-analytics', sync)
    return () => window.removeEventListener('mmi-consent-analytics', sync)
  }, [])

  if (!GA_MEASUREMENT_ID || !allowed) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsEvents measurementId={GA_MEASUREMENT_ID} />
      </Suspense>
    </>
  )
}
