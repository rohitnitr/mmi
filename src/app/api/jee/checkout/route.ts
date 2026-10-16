import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/lib/jee/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getStudent, loadStates } from '@/lib/jee/entitlements'
import { PRICE_PAISE } from '@/lib/jee/shared'
import { UUID_RE } from '@/lib/jee/exam-shared'
import { creditsFor } from '@/lib/jee/pay'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const fail = (error: string, status: number) => NextResponse.json({ error }, { status })

// Creates a Razorpay order. The price is decided HERE, from the database. The browser only says which test and tier.
export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return fail('Please sign in again.', 401)

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return fail('Payments are not switched on yet. Please try again later.', 503)

  let b: { testId?: unknown; tier?: unknown } = {}
  try { b = await req.json() } catch { /* handled below */ }
  const testId = typeof b.testId === 'string' ? b.testId : ''
  const tier = b.tier === 'mock' || b.tier === 'analysis' ? b.tier : null
  if (!UUID_RE.test(testId) || !tier) return fail('Invalid request.', 400)

  const student = await getStudent(user.id)
  if (!student?.onboarded_at) return fail('Please finish your profile first.', 409)

  // Only live tests that contain questions are returned here, so an empty or draft exam can never be bought.
  const st = (await loadStates(user.id)).find((s) => s.test.id === testId)
  if (!st) return fail('This mock is not available right now.', 404)
  if (st.test.is_free) return fail('This mock is free. You can start it without payment.', 400)

  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - 3_600_000).toISOString()
  const { count: recent } = await db.from('jee_purchases').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'created').gte('created_at', since)
  if ((recent ?? 0) >= 10) return fail('Too many payment attempts. Please wait a few minutes and try again.', 429)

  const c = await creditsFor(db, user.id, testId)
  const mockPrice = st.test.price_paise && st.test.price_paise > 0 ? st.test.price_paise : PRICE_PAISE.mock
  let amount: number
  let grants: number
  if (tier === 'mock') {
    if (st.attempt === 'in_progress') return fail('Finish your current attempt first.', 409)
    if (c.available > 0) return fail('You already have an unused attempt for this mock. Start it from the store.', 409)
    amount = mockPrice
    grants = 1
  } else {
    if (c.hasAnalysis) return fail('You already have the full analysis for this mock.', 409)
    amount = c.owns ? PRICE_PAISE.upgrade : mockPrice + PRICE_PAISE.upgrade // already bought the mock: pay only the difference
    grants = c.owns ? 0 : 1 // the upgrade does not give another attempt
  }

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64') },
    body: JSON.stringify({
      amount, currency: 'INR',
      receipt: `jee_${Date.now().toString(36)}_${user.id.slice(0, 8)}`,
      notes: { user_id: user.id, test_id: testId, tier, attempts: String(grants) },
    }),
  })
  if (!res.ok) {
    console.error('[jee checkout] razorpay order failed', res.status, await res.text())
    return fail('Could not start the payment. Please try again.', 502)
  }
  const order = (await res.json()) as { id: string }

  const { error } = await db.from('jee_purchases').insert({
    user_id: user.id, test_id: testId, tier, amount_paise: amount, attempts_granted: grants, status: 'created', razorpay_order_id: order.id,
  })
  if (error) {
    console.error('[jee checkout] insert purchase', error.message)
    return fail('Could not start the payment. Please try again.', 500)
  }

  return NextResponse.json({
    orderId: order.id, amount, currency: 'INR', keyId,
    name: student.full_name ?? '', email: user.email ?? '', contact: student.phone ?? '',
  })
}
