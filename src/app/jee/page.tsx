import type { Metadata } from 'next'
import JeeLanding from '@/components/jee/JeeLanding'

export const metadata: Metadata = {
  title: 'JEE Main mock tests from \u20b911, with a full analysis | MatchMyInterview',
  description: 'JEE-style mock tests from \u20b911 with marks, rank and percentile, plus a full analysis of mistakes, time per question and a practice plan. Sign in with Google.',
  openGraph: { title: 'JEE Main mock tests from \u20b911', description: 'Practise in a JEE-style interface and know exactly what to fix.', type: 'website' },
}

export default function JeePage() {
  return <JeeLanding />
}
