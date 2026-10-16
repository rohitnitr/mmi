import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hmacHex, safeEqual, settleOrder } from '@/lib/jee/pay'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Razorpay calls this server-to-server, so a payment still unlocks even if the student closes the tab.
// Set RAZORPAY_WEBHOOK_SECRET to the secret you typed in Razorpay > Webhooks.
// Events to enable: payment.captured, order.paid, payment.failed, refund.processed
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 })

  const raw = await req.text()
  const sig = req.headers.get('x-razorpay-signature') || ''
  if (!sig || !safeEqual(hmacHex(secret, raw), sig)) return NextResponse.json({ error: 'Bad signature.' }, { status: 400 })

  let ev: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } }; order?: { entity?: { id?: string } }; refund?: { entity?: { payment_id?: string } } } }
  try { ev = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Bad body.' }, { status: 400 }) }

  const pay = ev.payload?.payment?.entity
  try {
    if (ev.event === 'payment.captured' || ev.event === 'order.paid') {
      const orderId = pay?.order_id || ev.payload?.order?.entity?.id
      if (pay?.id && orderId) console.log('[jee webhook]', ev.event, orderId, await settleOrder(orderId, pay.id))
    } else if (ev.event === 'payment.failed') {
      if (pay?.order_id) await getSupabaseAdmin().from('jee_purchases').update({ status: 'failed' }).eq('razorpay_order_id', pay.order_id).eq('status', 'created')
    } else if (ev.event === 'refund.processed') {
      const pid = ev.payload?.refund?.entity?.payment_id
      if (pid) await getSupabaseAdmin().from('jee_purchases').update({ status: 'refunded' }).eq('razorpay_payment_id', pid)
    }
  } catch (e) {
    console.error('[jee webhook] failed', e)
    return NextResponse.json({ error: 'Retry later.' }, { status: 500 }) // Razorpay will retry
  }
  return NextResponse.json({ ok: true })
}
