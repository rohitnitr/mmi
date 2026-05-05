import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// ── Vercel Cron: runs every 15 minutes ───────────────────────────────────────
// Picks 3–5 users with complete profiles at random and bumps their last_active
// to now(). This keeps the peer list feeling alive for visitors — the list will
// show different faces each time the page loads or refreshes.
//
// Security: protected by CRON_SECRET so only Vercel's scheduler can call it.

export async function GET(req: Request) {
  // Verify the secret header set by Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = getSupabaseAdmin()

    // Fetch users that have a complete profile (domain + target_role filled in)
    // We only want to surface quality, complete profiles to visitors.
    const { data: candidates, error: fetchErr } = await admin
      .from('users')
      .select('id')
      .neq('domain', '')
      .neq('target_role', '')
      .limit(50) // work from a pool of up to 50 complete profiles

    if (fetchErr) throw fetchErr
    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ rotated: 0, message: 'No complete profiles found' })
    }

    // Shuffle the pool and pick 3–5 at random
    const shuffled = candidates.sort(() => Math.random() - 0.5)
    const pickCount = Math.floor(Math.random() * 3) + 3 // 3, 4, or 5
    const picked = shuffled.slice(0, Math.min(pickCount, shuffled.length))
    const pickedIds = picked.map((u: { id: string }) => u.id)

    // Bump their last_active to right now
    const { error: updateErr } = await admin
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .in('id', pickedIds)

    if (updateErr) throw updateErr

    return NextResponse.json({
      rotated: pickedIds.length,
      ids: pickedIds,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[rotate-peers cron]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
