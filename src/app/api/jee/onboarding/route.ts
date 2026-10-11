import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/lib/jee/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { normalisePhone } from '@/lib/jee/shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  let b: { name?: unknown; phone?: unknown; targetYear?: unknown; agree?: unknown } = {}
  try { b = await req.json() } catch { /* handled below */ }

  const name = typeof b.name === 'string' ? b.name.trim().replace(/\s+/g, ' ') : ''
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
  const phone = typeof b.phone === 'string' ? normalisePhone(b.phone) : null
  if (!phone) return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number.' }, { status: 400 })
  if (b.agree !== true) return NextResponse.json({ error: 'Please accept the Terms and Privacy Policy to continue.' }, { status: 400 })
  const y = Number(b.targetYear)
  const targetYear = Number.isInteger(y) && y >= 2027 && y <= 2030 ? y : null

  const now = new Date().toISOString()
  const { error } = await getSupabaseAdmin().from('jee_students').upsert(
    { user_id: user.id, email: user.email ?? '', full_name: name, phone, target_year: targetYear, onboarded_at: now, consent_at: now },
    { onConflict: 'user_id' }
  )
  if (error) {
    console.error('[jee onboarding]', error.message)
    return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
