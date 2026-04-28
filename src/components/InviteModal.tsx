'use client'

import { useState } from 'react'

interface UserProfile {
  id: string
  username: string
  experience: string
  domain: string
  target_role: string
  coffee_balance: number
}

interface InviteModalProps {
  receiver: UserProfile
  onSend: (note: string) => Promise<void>
  onClose: () => void
  sending: boolean
}

export default function InviteModal({ receiver, onSend, onClose, sending }: InviteModalProps) {
  const [note, setNote] = useState('')
  const MAX = 200

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box invite-modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="invite-modal-header">
          <div className="avatar md">{receiver.username.slice(0, 2).toUpperCase()}</div>
          <div>
            <p className="invite-modal-name">{receiver.username}</p>
            <div className="invite-modal-tags">
              <span className="tag">{receiver.experience}</span>
              {receiver.domain && <span className="tag">{receiver.domain}</span>}
              {receiver.target_role && <span className="tag tag-role">🎯 {receiver.target_role}</span>}
            </div>
          </div>
        </div>

        <div className="invite-modal-body">
          <label className="form-label" style={{ marginBottom: 8 }}>
            Add a note <span style={{ fontWeight: 400, color: '#71717a' }}>(optional)</span>
          </label>
          <textarea
            className="invite-note-area"
            placeholder="Hi! I'm preparing for frontend roles. Want to do a quick mock together?"
            value={note}
            onChange={e => setNote(e.target.value.slice(0, MAX))}
            rows={4}
          />
          <p className="note-count">{note.length}/{MAX}</p>
        </div>

        <button
          className="btn btn-primary w-full invite-coffee-btn"
          onClick={() => onSend(note)}
          disabled={sending}
        >
          {sending ? <span className="spinner" /> : <><span>☕</span> Offer a Coffee</>}
        </button>
        <p className="invite-modal-hint">Costs 1 coffee · They have 24h to accept · Refund if declined</p>
      </div>
    </div>
  )
}
