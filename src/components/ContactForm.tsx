'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, company: honeypot }),
      })
      setStatus(res.ok ? 'ok' : 'err')
    } catch {
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return <p>Thanks. We received your message and typically reply within 24–48 hours.</p>
  }

  return (
    <form className="mh-form" onSubmit={submit}>
      <h2>Send a message</h2>
      <label>
        Your name
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
      </label>
      <label className="sr-only">
        Company
        <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <label>
        How can we help?
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} maxLength={4000} />
      </label>
      <button className="mh-btn mh-btn-primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      {status === 'err' && <p>Could not send right now. Email support@matchmyinterview.com instead.</p>}
    </form>
  )
}
