import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export function hmacHex(secret: string, data: string) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}
export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

// Idempotent: the browser callback and the webhook can both call this for the same order.
export async function markPaid(orderId: string, paymentId: string, userId?: string): Promise<'paid' | 'already' | 'missing' | 'ignored' | 'duplicate'> {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.from('jee_purchases').select('id,user_id,status').eq('razorpay_order_id', orderId).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return 'missing'
  const row = data as { id: string; user_id: string; status: string }
  if (userId && row.user_id !== userId) return 'missing'
  if (row.status === 'paid') return 'already'
  if (row.status === 'refunded') return 'ignored'

  const { error: upErr } = await admin.from('jee_purchases').update({ status: 'paid', razorpay_payment_id: paymentId }).eq('id', row.id).in('status', ['created', 'failed'])
  if (upErr) {
    if (upErr.code === '23505') {
      // The student already has a paid purchase for this item. A second payment went through and needs a manual refund.
      console.error('[jee] DUPLICATE PAYMENT needs refund', { orderId, paymentId })
      return 'duplicate'
    }
    throw new Error(upErr.message)
  }
  return 'paid'
}
