'use client'

import { useState } from 'react'

interface PaymentModalProps {
  userId: string
  onClose: () => void
  onSuccess: (coffees: number) => void
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: { email?: string }
  theme?: { color?: string }
}

interface RazorpayInstance { open: () => void }
interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

const AMOUNT = 99   // ₹99
const COFFEES = 5   // = 5 coffees

export default function PaymentModal({ userId, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(s)
        })
      }

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: AMOUNT }),
      })
      const { order, error: orderError } = await res.json()
      if (orderError) throw new Error(orderError)

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: 'INR',
        name: 'MatchMyInterview',
        description: `${COFFEES} coffees — invite peers to practice`,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, userId, amount: AMOUNT }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            onSuccess(verifyData.coffees_added)
            onClose()
          } else {
            setError('Payment verification failed. Contact support.')
          }
        },
        theme: { color: '#18181b' },
      })
      rzp.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-logo">☕</div>
          <h2 className="modal-title">Top Up Coffees</h2>
          <p className="modal-subtitle">Buy peers a coffee to practice together</p>
        </div>

        <div className="payment-card">
          <div className="payment-plan">
            <span className="payment-amount">₹{AMOUNT}</span>
            <span className="payment-coffees">{COFFEES} ☕ coffees</span>
            <span className="payment-per">Invite {COFFEES} peers for practice sessions</span>
          </div>
          <ul className="payment-features">
            <li>✓ 1 coffee = invite 1 peer to practice</li>
            <li>✓ Refund if they don&apos;t accept in 24h</li>
            <li>✓ Instant voice call connection</li>
          </ul>
        </div>

        <button className="btn btn-primary w-full" onClick={handlePay} disabled={loading}>
          {loading ? <span className="spinner" /> : `Buy ${COFFEES} Coffees for ₹${AMOUNT} →`}
        </button>

        {error && <p className="form-error">{error}</p>}
        <p className="payment-note">Secured by Razorpay · UPI / Cards / NetBanking</p>
      </div>
    </div>
  )
}
