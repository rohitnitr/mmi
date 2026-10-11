import { NextRequest, NextResponse } from 'next/server'
import { hmacHex, markPaid, safeEqual } from '@/lib/jee/payments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Razorpay dashboard > Webhooks: URL .../api/jee/payment/webhook, events payment.captured and order.paid, secret = RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured.' }, { status: 503 })

  const raw = await req.text()
  const sig = req.headers.get('x-razorpay-signature') ?? ''
  if (!sig || !safeEqual(hmacHex(secret, raw), sig)) return NextResponse.json({ error: 'Bad signature.' }, { status: 400 })

  let evt: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } } = {}
  try { evt = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Bad body.' }, { status: 400 }) }

  if (evt.event === 'payment.captured' || evt.event === 'order.paid') {
    const p = evt.payload?.payment?.entity
    if (p?.id && p.order_id) {
      try { await markPaid(p.order_id, p.id) } catch (e) {
        console.error('[jee webhook]', e)
        return NextResponse.json({ error: 'Retry.' }, { status: 500 }) // Razorpay retries on non-2xx
      }
    }
  }
  return NextResponse.json({ ok: true })
}
