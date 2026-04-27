import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'MatchMyInterview — Practice Mock Interviews with Real People',
  description:
    'Anonymous, voice-only platform for practicing mock interviews. Match with peers, practice live, improve fast. ₹29 per session.',
  keywords: 'mock interview, interview practice, peer interview, voice practice',
  openGraph: {
    title: 'MatchMyInterview',
    description: 'Practice mock interviews with real people, anonymously.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
