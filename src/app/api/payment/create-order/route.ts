import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || keyId.startsWith('your_')) {
      return NextResponse.json({ error: 'Razorpay not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to env.' }, { status: 503 })
    }
    if (!keySecret || keySecret.startsWith('your_')) {
      return NextResponse.json({ error: 'Razorpay secret not configured.' }, { status: 503 })
    }

    const amountInPaise = (amount || 99) * 100
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `mmi_${Date.now()}`,
    })

    return NextResponse.json({ order })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Razorpay create-order error:', message)
    return NextResponse.json({ error: `Failed to create order: ${message}` }, { status: 500 })
  }
}
