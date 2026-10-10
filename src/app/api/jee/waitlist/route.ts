import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const EXAMS = ['JEE Main 2027 Session 1', 'JEE Main 2027 Session 2', 'JEE Advanced 2027', 'Other']
const tag = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 60) : null)

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
    if (b.website) return NextResponse.json({ ok: true }) // honeypot: bots fill this in
    const email = typeof b.email === 'string' ? b.email.trim() : ''
    if (!EMAIL_RE.test(email) || email.length > 254) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
    if (b.consent !== true) return NextResponse.json({ error: 'Please tick the consent box.' }, { status: 400 })
    const exam = typeof b.exam === 'string' && EXAMS.includes(b.exam) ? b.exam : null

    const { error } = await getSupabaseAdmin().from('jee_waitlist').insert({
      email, target_exam: exam, consent: true, source: tag(b.source), medium: tag(b.medium), campaign: tag(b.campaign),
    })
    if (error && error.code !== '23505') { // 23505 = already on the list: treat as success
      console.error('[jee waitlist]', error.message)
      return NextResponse.json({ error: 'Could not save that. Please try again.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
