import type { Metadata } from 'next'
import JeeLanding from '@/components/jee/JeeLanding'

export const metadata: Metadata = {
  title: 'JEE Main mock tests with a full analysis | MatchMyInterview',
  description: 'Full-length JEE-style mock tests with a detailed analysis after every attempt: subject breakdown, time per question and a practice plan. Marks, country-wide rank and percentile, from ₹11.',
  openGraph: { title: 'JEE-style mock tests with a full analysis', description: 'Practice in a JEE-style interface. Know exactly what to fix.', type: 'website' },
}

export default function JeePage() {
  return <JeeLanding />
}
