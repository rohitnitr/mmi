import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL('https://matchmyinterview.com'),
  title: {
    default: 'MatchMyInterview — The Peer-Validated Professional Portfolio',
    template: '%s | MatchMyInterview'
  },
  description: 'Practice with real people. Get interviewed. Receive peer feedback. Build a professional portfolio backed by real interview evidence.',
  keywords: ['mock interview', 'interview practice', 'peer interview', 'skill validation', 'interview portfolio', 'software engineering interview', 'data analyst interview', 'free mock interviews'],
  authors: [{ name: 'MatchMyInterview Team' }],
  creator: 'MatchMyInterview',
  publisher: 'MatchMyInterview',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'MatchMyInterview — Practice Mock Interviews with Real Peers',
    description: 'A 100% free, peer-to-peer mock interview platform. Connect with real people, practice live, and land your dream job faster.',
    url: 'https://matchmyinterview.com',
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
    title: 'MatchMyInterview — Practice Mock Interviews with Real Peers',
    description: 'A 100% free, peer-to-peer mock interview platform. Connect with real people, practice live, and land your dream job faster.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
