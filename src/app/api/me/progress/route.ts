import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/public-profile'
import { buildAll } from '@/lib/mmi-stats'

export const dynamic = 'force-dynamic'

// Your own progress. Requires a logged-in Bearer token.
export async function GET(req: NextRequest) {
  const admin = adminClient()
  if (!admin) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 })
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })
  const { data, error } = await admin.auth.getUser(token)
  const uid: string | undefined = error ? undefined : data?.user?.id
  if (!uid) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })
  try {
    const all = await buildAll(admin)
    const me = all.get(uid)
    if (!me) return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    return NextResponse.json(me)
  } catch {
    return NextResponse.json({ error: 'Could not load progress.' }, { status: 500 })
  }
}
