'use client'

interface PaymentModalProps {
  userId: string
  onClose: () => void
  onSuccess: (coffees: number) => void
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-logo">☕</div>
          <h2 className="modal-title">Unlimited Coffee</h2>
          <p className="modal-subtitle">MatchMyInterview is completely free for all verified users</p>
        </div>

        <div className="payment-card">
          <div className="payment-plan">
            <span className="payment-amount">Free</span>
            <span className="payment-coffees">∞ Unlimited ☕ coffees</span>
            <span className="payment-per">Invite as many peers as you want</span>
          </div>
          <ul className="payment-features">
            <li>✓ Verify your email to get started</li>
            <li>✓ Send unlimited coffee invites</li>
            <li>✓ Real mock interview sessions</li>
            <li>✓ No credit card needed</li>
          </ul>
        </div>

        <button className="btn btn-primary w-full" onClick={onClose}>
          Got it! Start Practicing →
        </button>

        <p className="payment-note">100% Free · Email verification required</p>
      </div>
    </div>
  )
}
