import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/public-profile'
import { getTalent } from '@/lib/talent'

export const dynamic = 'force-dynamic'

// Public. Only returns members who chose a public profile.
export async function GET(req: NextRequest) {
  const admin = adminClient()
  if (!admin) return NextResponse.json({ items: [], total: 0, domains: [] })
  const sp = req.nextUrl.searchParams
  const limit = Math.max(1, Math.min(60, Number(sp.get('limit') || 24)))
  try {
    const out = await getTalent(admin, {
      q: sp.get('q') || undefined,
      domain: sp.get('domain') || undefined,
      skill: sp.get('skill') || undefined,
      ratedOnly: sp.get('rated') === '1',
      limit,
    })
    return NextResponse.json(out, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
  } catch {
    return NextResponse.json({ items: [], total: 0, domains: [] })
  }
}
