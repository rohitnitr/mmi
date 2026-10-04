import type { Metadata } from 'next'
import { getPublicUser } from '@/lib/public-profile'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const name = decodeURIComponent(username)
  const pub = await getPublicUser(username)
  if (!pub) return { title: 'Profile | MatchMyInterview', robots: { index: false, follow: false } }
  const title = name + ' | Peer-rated interview portfolio'
  const description = 'Skills and interview performance rated by real peers on MatchMyInterview.'
  return { title, description, openGraph: { title, description, type: 'profile' }, twitter: { card: 'summary_large_image', title, description } }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
