import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/public-profile'

export const dynamic = 'force-dynamic'

// Public. Returns ONLY display name and photo, and ONLY for members who made their profile public.
export async function GET() {
  const empty = NextResponse.json({ items: {} })
  try {
    const admin = adminClient()
    if (!admin) return empty
    const { data, error } = await admin
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .eq('is_public', true)
      .range(0, 9999)
    if (error) return empty
    const items: Record<string, { display_name: string | null; avatar_url: string | null }> = {}
    for (const p of (data ?? []) as any[]) {
      items[String(p.user_id)] = { display_name: p.display_name ?? null, avatar_url: p.avatar_url ?? null }
    }
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch {
    return empty
  }
}
