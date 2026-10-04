import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  let body: { email?: unknown; company?: unknown } = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  // Honeypot: real visitors never fill this hidden field
  if (typeof body.company === 'string' && body.company.trim()) return NextResponse.json({ ok: true })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || email.length > 254 || !EMAIL.test(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { error } = await db.from('newsletter_subscribers').insert({ email, source: 'blog' })
  // 23505 = already subscribed. Treat as success so addresses cannot be probed.
  if (error && error.code !== '23505') return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
