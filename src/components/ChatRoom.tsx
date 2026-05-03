'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getClient } from '@/lib/supabase/client'

interface Message {
  id: string
  session_id: string
  sender_id: string
  content: string
  created_at: string
}

interface PeerProfile {
  id: string
  username: string
  experience: string
  domain: string
  target_role: string
}

interface ChatRoomProps {
  sessionId: string
  userId: string
  peerUserId: string
  otherUsername: string
  onBack: () => void
  onEnd: () => void
}

export default function ChatRoom({ sessionId, userId, peerUserId, otherUsername, onBack, onEnd }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [ending, setEnding] = useState(false)
  const [peerProfile, setPeerProfile] = useState<PeerProfile | null>(null)
  const [showPeerProfile, setShowPeerProfile] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load peer profile
  useEffect(() => {
    if (!peerUserId) return
    const c = getClient(); if (!c) return
    c.from('users')
      .select('id, username, experience, domain, target_role')
      .eq('id', peerUserId)
      .maybeSingle()
      .then(({ data }: { data: PeerProfile | null }) => {
        if (data) setPeerProfile(data)
      })
  }, [peerUserId])

  // Load history + subscribe to realtime
  useEffect(() => {
    const c = getClient(); if (!c) return

    const loadHistory = async () => {
      const { data } = await c.from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(500)
      if (data) setMessages(data)
    }
    loadHistory()

    const channel = c.channel(`chat-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`,
      }, (payload: any) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new as Message]
        })
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [sessionId])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')

    const c = getClient(); if (!c) { setSending(false); return }

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      session_id: sessionId,
      sender_id: userId,
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { data, error } = await c.from('messages').insert({
      session_id: sessionId,
      sender_id: userId,
      content: text,
    }).select().single()

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(text)
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    }

    setSending(false)
    inputRef.current?.focus()
  }, [input, sending, sessionId, userId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleEnd = async () => {
    if (!confirm("End this session? You won't be able to continue chatting.")) return
    setEnding(true)
    try {
      await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      })
    } catch {}
    onEnd()
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch { return '' }
  }

  return (
    <div className="inline-chat">
      {/* Peer profile mini-card overlay */}
      {showPeerProfile && peerProfile && (
        <div className="peer-profile-overlay" onClick={() => setShowPeerProfile(false)}>
          <div className="peer-profile-card" onClick={e => e.stopPropagation()}>
            <button className="peer-profile-close" onClick={() => setShowPeerProfile(false)}>✕</button>
            <div className="peer-profile-avatar-lg">{peerProfile.username.slice(0, 2).toUpperCase()}</div>
            <h3 className="peer-profile-name">{peerProfile.username}</h3>
            <div className="peer-profile-fields">
              <div className="peer-profile-row">
                <span className="pp-label">Experience</span>
                <span className="pp-value">{peerProfile.experience || '—'}</span>
              </div>
              <div className="peer-profile-row">
                <span className="pp-label">Domain</span>
                <span className="pp-value">{peerProfile.domain || '—'}</span>
              </div>
              <div className="peer-profile-row">
                <span className="pp-label">Target Role</span>
                <span className="pp-value">{peerProfile.target_role || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={onBack} title="Back to chats">‹</button>
        <button
          className="chat-peer-avatar-btn"
          onClick={() => setShowPeerProfile(true)}
          title="View profile"
        >
          {otherUsername.slice(0, 2).toUpperCase()}
        </button>
        <div className="chat-header-info">
          <button className="chat-peer-name-btn" onClick={() => setShowPeerProfile(true)}>
            {otherUsername}
          </button>
          <span className="chat-peer-status"><span className="online-dot-sm" /> Mock Interview Session</span>
        </div>
        <button className="chat-end-btn" onClick={handleEnd} disabled={ending}>
          {ending ? '…' : 'End Session'}
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span style={{ fontSize: 32 }}>☕</span>
            <p>You matched! Say hello and begin your mock interview.</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`chat-bubble-row${isMe ? ' me' : ' them'}`}>
              {!isMe && (
                <button
                  className="chat-bubble-avatar clickable"
                  onClick={() => setShowPeerProfile(true)}
                  title="View profile"
                >
                  {otherUsername.slice(0, 2).toUpperCase()}
                </button>
              )}
              <div className={`chat-bubble${isMe ? ' bubble-me' : ' bubble-them'}`}>
                <span className="bubble-text">{msg.content}</span>
                <span className="bubble-time">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          placeholder="Type a message… (Enter to send)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1000}
          autoFocus
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
        >
          {sending
            ? <span className="spinner sm" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} />
            : '↑'}
        </button>
      </div>
    </div>
  )
}
