import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/lib/jee/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getStudent, loadStates } from '@/lib/jee/entitlements'
import { PRICE_PAISE } from '@/lib/jee/shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const fail = (error: string, status: number) => NextResponse.json({ error }, { status })

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
  if (!testId || !tier) return fail('Invalid request.', 400)

  const student = await getStudent(user.id)
  if (!student?.onboarded_at) return fail('Please finish your profile first.', 409)

  const st = (await loadStates(user.id)).find((s) => s.test.id === testId)
  if (!st) return fail('This mock is not available right now.', 404)
  if (st.test.is_free) return fail('This mock is completely free! You can start it right away without payment.', 400)

  // Only block if student owns it AND hasn't finished the attempt. If attempt === 'done', they are allowed to buy again!
  if (tier === 'mock' && st.hasMock && st.attempt !== 'done') return fail('You already have an active attempt for this mock.', 409)
  if (tier === 'analysis' && st.hasAnalysis && st.attempt !== 'done') return fail('You already have the analysis for this mock.', 409)

  const defaultMockPrice = st.test.price_paise && st.test.price_paise > 0 ? st.test.price_paise : PRICE_PAISE.mock
  const amount = tier === 'mock' ? defaultMockPrice : st.analysisPaise

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64') },
    body: JSON.stringify({
      amount, currency: 'INR',
      receipt: `jee_${Date.now().toString(36)}_${user.id.slice(0, 8)}`,
      notes: { user_id: user.id, test_id: testId, tier },
    }),
  })
  if (!res.ok) {
    console.error('[jee checkout] razorpay order failed', res.status, await res.text())
    return fail('Could not start the payment. Please try again.', 502)
  }
  const order = (await res.json()) as { id: string }

  const { error } = await getSupabaseAdmin().from('jee_purchases').insert({
    user_id: user.id, test_id: testId, tier, amount_paise: amount, status: 'created', razorpay_order_id: order.id,
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
