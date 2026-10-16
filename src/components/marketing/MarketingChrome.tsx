'use client'

import { useRouter } from 'next/navigation'
import './marketing.css'
import './marketing-v2.css'
import MarketingNav from './MarketingNav'
import MarketingFooter from './MarketingFooter'

export default function MarketingChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="mh">
      <MarketingNav onAuth={() => router.push('/?signin=1')} />
      {children}
      <MarketingFooter />
    </div>
  )
}
