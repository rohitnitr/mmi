'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { normalisePhone } from '@/lib/jee/shared'

export default function OnboardingForm({ initialName, email, photo }: { initialName: string; email: string; photo: string }) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState('')
  const [year, setYear] = useState('2027')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    if (name.trim().length < 2) return setErr('Please enter your full name.')
    if (!normalisePhone(phone)) return setErr('Enter a valid 10-digit Indian mobile number.')
    if (!agree) return setErr('Please accept the Terms and Privacy Policy to continue.')
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/jee/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, targetYear: year, agree }) })
      const d = (await r.json().catch(() => ({}))) as { error?: string }
      if (!r.ok) { setErr(d.error ?? 'Something went wrong. Please try again.'); setBusy(false); return }
      router.replace('/jee/store')
    } catch {
      setErr('No connection. Please check your internet and try again.')
      setBusy(false)
    }
  }

  return (
    <form className="js-card" onSubmit={submit} noValidate>
      <div className="js-who">
        {photo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={photo} alt="" referrerPolicy="no-referrer" width={48} height={48} className="jd-av" style={{ width: 48, height: 48 }} />
          : <div className="jd-av jd-ini" style={{ width: 48, height: 48, fontSize: 20 }} aria-hidden="true">{(name || email).slice(0, 1).toUpperCase()}</div>}
        <div><b>Almost there</b><div className="jx-small">{email}</div></div>
      </div>

      <label className="js-field"><span>Full name</span>
        <input className="js-in" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} placeholder="Your full name" />
      </label>

      <label className="js-field"><span>Mobile number</span>
        <div className="js-phone"><b>+91</b>
          <input className="js-in" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel-national" maxLength={14} placeholder="10-digit number" />
        </div>
      </label>

      <label className="js-field"><span>JEE attempt year <em style={{ fontWeight: 500, color: 'var(--mut)' }}>(optional)</em></span>
        <select className="js-in" value={year} onChange={(e) => setYear(e.target.value)}>
          {['2027', '2028', '2029', '2030'].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>

      <label className="js-check">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. If I am under 18, my parent or guardian knows I am signing up.</span>
      </label>

      {err && <p className="js-err" role="alert">{err}</p>}
      <button type="submit" className="jx-cta js-full" disabled={busy}>{busy ? 'Saving\u2026' : 'Continue to the store'}</button>
      <p className="jx-small" style={{ textAlign: 'center', margin: '12px 0 0' }}>We use your number only for your account and payment receipts.</p>
    </form>
  )
}
