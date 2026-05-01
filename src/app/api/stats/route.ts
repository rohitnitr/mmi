import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Public endpoint — uses service role to bypass RLS
// Returns total invite count (coffee shared metric for landing page)
export async function GET() {
  try {
    const admin = getSupabaseAdmin()
    const { count, error } = await admin
      .from('invites')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return NextResponse.json({ count: count ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ count: 0, error: err.message }, { status: 500 })
  }
}
