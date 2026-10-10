import type { Metadata } from 'next'
import JeeLandingPage from '@/components/jee/JeeLandingPage'

export const metadata: Metadata = {
  title: 'JEE Main mock tests from ₹11 | MatchMyInterview',
  description: 'Full-length JEE-style mocks with a real exam screen, marks, country-wide rank and percentile, and a complete analysis of your mistakes and time per question.',
}

export default function Page() {
  return <JeeLandingPage />
}
