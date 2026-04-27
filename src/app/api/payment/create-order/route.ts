import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()
    const amountInPaise = (amount || 99) * 100

    // Lazy-import Razorpay to avoid module-load validation error
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `mmi_${Date.now()}`,
    })

    return NextResponse.json({ order })
  } catch (err) {
    console.error('Razorpay order error:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
