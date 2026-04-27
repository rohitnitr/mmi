import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface UserRow { coffee_balance: number }

// Fixed packages: ₹99 = 5 coffees
const PACKAGES: { amount: number; coffees: number }[] = [
  { amount: 99, coffees: 5 },
]

function coffeesForAmount(amount: number): number {
  const pkg = PACKAGES.find((p) => p.amount === amount)
  if (pkg) return pkg.coffees
  // Fallback: proportional (₹99 / 5 ≈ ₹20 per coffee)
  return Math.floor(amount / 20)
}

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = await req.json()

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })

    const coffees = coffeesForAmount(amount)
    if (coffees < 1) return NextResponse.json({ error: 'Amount too low' }, { status: 400 })

    const db = getSupabaseAdmin()
    const { data } = await db.from('users').select('coffee_balance').eq('id', userId).single()
    if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const user = data as UserRow
    await db.from('users').update({ coffee_balance: user.coffee_balance + coffees }).eq('id', userId)
    await db.from('transactions').insert({ user_id: userId, type: 'credit', amount: coffees, reason: 'topup' })

    return NextResponse.json({ success: true, coffees_added: coffees })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
