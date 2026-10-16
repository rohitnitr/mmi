// Server-only payment helpers. Never import from a client component.
import crypto from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const hmacHex = (secret: string, data: string) => crypto.createHmac('sha256', secret).update(data).digest('hex')

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

function authHeader(): string {
  const id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!id || !secret) throw new Error('Razorpay keys are not configured')
  return 'Basic ' + Buffer.from(id + ':' + secret).toString('base64')
}

export type Settled = 'paid' | 'already' | 'missing' | 'mismatch' | 'not_captured'

/**
 * Marks an order paid ONLY after asking Razorpay itself whether that payment is real, for the right order,
 * the right amount and currency. Safe to call many times (browser verify, webhook, reconcile): the status
 * flip is atomic, so the purchase is granted exactly once.
 */
export async function settleOrder(orderId: string, paymentId: string, onlyUserId?: string): Promise<Settled> {
  const db = getSupabaseAdmin()
  const { data: row, error } = await db
    .from('jee_purchases')
    .select('id,user_id,amount_paise,status')
    .eq('razorpay_order_id', orderId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!row || (onlyUserId && row.user_id !== onlyUserId)) return 'missing'
  if (row.status === 'paid') return 'already'
  if (row.status === 'refunded') return 'mismatch'

  const r = await fetch('https://api.razorpay.com/v1/payments/' + encodeURIComponent(paymentId), { headers: { Authorization: authHeader() } })
  if (!r.ok) throw new Error('Razorpay lookup failed: ' + r.status)
  const p = (await r.json()) as { order_id: string; amount: number; currency: string; status: string }
  if (p.order_id !== orderId || p.currency !== 'INR' || p.amount !== row.amount_paise) {
    console.error('[jee pay] mismatch', { orderId, paymentId, expected: row.amount_paise, got: p.amount })
    return 'mismatch'
  }
  if (p.status === 'authorized') {
    const c = await fetch('https://api.razorpay.com/v1/payments/' + encodeURIComponent(paymentId) + '/capture', {
      method: 'POST',
      headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: p.amount, currency: 'INR' }),
    })
    if (!c.ok) throw new Error('Razorpay capture failed: ' + c.status)
  } else if (p.status !== 'captured') {
    return 'not_captured'
  }

  const { data: flipped, error: e2 } = await db
    .from('jee_purchases')
    .update({ status: 'paid', razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
    .eq('id', row.id)
    .in('status', ['created', 'failed'])
    .select('id')
  if (e2) {
    if (e2.code === '23505') return 'mismatch'
    throw new Error(e2.message)
  }
  return flipped && flipped.length ? 'paid' : 'already'
}

/** Attempts a student may still start for a test = attempts paid for minus attempts already created. */
export async function creditsFor(db: SupabaseClient, userId: string, testId: string) {
  const [p, a] = await Promise.all([
    db.from('jee_purchases').select('tier,attempts_granted').eq('user_id', userId).eq('test_id', testId).eq('status', 'paid'),
    db.from('jee_attempts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('test_id', testId),
  ])
  if (p.error) throw new Error(p.error.message)
  if (a.error) throw new Error(a.error.message)
  const rows = (p.data ?? []) as { tier: string; attempts_granted: number | null }[]
  const credits = rows.reduce((n, r) => n + (r.attempts_granted ?? 1), 0)
  const used = a.count ?? 0
  return { credits, used, available: Math.max(0, credits - used), owns: rows.length > 0, hasAnalysis: rows.some((r) => r.tier === 'analysis') }
}
