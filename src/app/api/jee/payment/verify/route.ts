import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/lib/jee/auth'
import { hmacHex, markPaid, safeEqual } from '@/lib/jee/payments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Called by the browser right after Razorpay checkout succeeds. The webhook is the backup if this call never arrives.
export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 })

  let b: { razorpay_order_id?: unknown; razorpay_payment_id?: unknown; razorpay_signature?: unknown } = {}
  try { b = await req.json() } catch { /* handled below */ }
  const orderId = typeof b.razorpay_order_id === 'string' ? b.razorpay_order_id : ''
  const paymentId = typeof b.razorpay_payment_id === 'string' ? b.razorpay_payment_id : ''
  const sig = typeof b.razorpay_signature === 'string' ? b.razorpay_signature : ''
  if (!orderId || !paymentId || !sig) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  if (!safeEqual(hmacHex(secret, `${orderId}|${paymentId}`), sig)) {
    return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 })
  }
  try {
    const r = await markPaid(orderId, paymentId, user.id)
    if (r === 'missing') return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, result: r })
  } catch (e) {
    console.error('[jee verify]', e)
    return NextResponse.json({ error: 'Could not confirm yet. It will unlock automatically in a minute.' }, { status: 500 })
  }
}
