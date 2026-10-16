import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CookieConsent } from '@/components/CookieConsent'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { JsonLd } from '@/components/JsonLd'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.matchmyinterview.com'),
  title: {
    default: 'MatchMyInterview — Peer Mock Interviews & JEE Mock Tests',
    template: '%s | MatchMyInterview'
  },
  description: 'Practice interviews with real peers for free, and take JEE Main mock tests from ₹11. Get honest feedback, track your progress and build a profile backed by real practice.',
  keywords: ['mock interview', 'interview practice', 'peer interview', 'skill validation', 'interview portfolio', 'software engineering interview', 'data analyst interview', 'free mock interviews', 'JEE Main mock test', 'JEE mock test online'],
  authors: [{ name: 'Rohit Poddar', url: 'https://www.matchmyinterview.com/about' }],
  creator: 'MatchMyInterview',
  publisher: 'MatchMyInterview',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'MatchMyInterview — Practice Interviews with Real Peers, Take JEE Mock Tests',
    description: 'Free peer-to-peer mock interviews, and JEE Main mock tests with a full analysis from ₹11. No subscription.',
    url: 'https://www.matchmyinterview.com',
    siteName: 'MatchMyInterview',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MatchMyInterview - Peer to Peer Mock Interviews',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MatchMyInterview — Practice Interviews with Real Peers, Take JEE Mock Tests',
    description: 'Free peer-to-peer mock interviews, and JEE Main mock tests with a full analysis from ₹11. No subscription.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// When Google gives you a publisher ID, add it to metadata as:
//   other: { 'google-adsense-account': 'ca-pub-XXXXXXXXXXXXXXXX' },
// and put the AdSense script only on public content pages (never the exam, store, dashboard or login).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <JsonLd />
        <GoogleAnalytics />
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
