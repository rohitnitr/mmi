import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown; company?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (typeof body.company === 'string' && body.company.trim()) {
    return NextResponse.json({ ok: true })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!name || name.length > 120) return NextResponse.json({ error: 'Please add your name.' }, { status: 400 })
  if (!email || !EMAIL.test(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
  if (!message || message.length > 4000) return NextResponse.json({ error: 'Please enter a message.' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { error } = await db.from('feedback').insert({
    user_id: null,
    text: `Contact form\nName: ${name}\nEmail: ${email}\n\n${message}`,
  })
  if (error) {
    console.error('[contact]', error.message)
    return NextResponse.json({ error: 'Could not save message.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
