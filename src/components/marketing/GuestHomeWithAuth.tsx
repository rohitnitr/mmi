'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import OnboardingModal from '@/components/OnboardingModal'
import GuestHomepage from './GuestHomepage'

export default function GuestHomeWithAuth() {
  const params = useSearchParams()
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    if (params.get('signin') === '1') setShowAuth(true)
  }, [params])

  return (
    <>
      {showAuth && <OnboardingModal onClose={() => setShowAuth(false)} />}
      <GuestHomepage onAuth={() => setShowAuth(true)} />
    </>
  )
}
