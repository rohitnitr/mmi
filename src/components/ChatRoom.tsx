'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface Message {
  id: string
  session_id: string
  sender_id: string
  content: string
  created_at: string
}

interface ChatRoomProps {
  sessionId: string
  userId: string
  otherUsername: string
  onEnd: () => void
}

function getSB() {
  if (typeof window === 'undefined') return null
  const { createClient } = require('@/lib/supabase/client')
  return createClient()
}

export default function ChatRoom({ sessionId, userId, otherUsername, onEnd }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [ending, setEnding] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<any>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load history + subscribe to realtime
  useEffect(() => {
    const c = getSB(); if (!c) return

    // Load message history
    const loadHistory = async () => {
      const { data } = await c.from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(200)
      if (data) setMessages(data)
    }
    loadHistory()

    // Subscribe to new messages via Supabase Realtime
    const channel = c.channel(`chat-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`,
      }, (payload: any) => {
        setMessages(prev => {
          // Avoid duplicates (optimistic update may have added it)
          if (prev.find(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new as Message]
        })
      })
      .subscribe()

    channelRef.current = channel
    return () => { channel.unsubscribe() }
  }, [sessionId])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')

    const c = getSB(); if (!c) { setSending(false); return }

    // Optimistic update
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      session_id: sessionId,
      sender_id: userId,
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { error } = await c.from('messages').insert({
      session_id: sessionId,
      sender_id: userId,
      content: text,
    })

    if (error) {
      // Rollback optimistic on error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(text)
    }
    setSending(false)
    inputRef.current?.focus()
  }, [input, sending, sessionId, userId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleEnd = async () => {
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
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="chat-room">
        {/* Header */}
        <div className="chat-room-header">
          <div className="chat-room-header-left">
            <div className="chat-peer-avatar">{otherUsername.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="chat-peer-name">{otherUsername}</div>
              <div className="chat-peer-status">
                <span className="online-dot-sm" />
                Mock Interview Session
              </div>
            </div>
          </div>
          <button className="chat-end-btn" onClick={handleEnd} disabled={ending} title="End session">
            {ending ? '...' : '✕ End'}
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <span style={{ fontSize: 28 }}>☕</span>
              <p>Session started! Say hi and begin your mock interview.</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === userId
            return (
              <div key={msg.id} className={`chat-bubble-row${isMe ? ' me' : ' them'}`}>
                {!isMe && (
                  <div className="chat-bubble-avatar">{otherUsername.slice(0, 2).toUpperCase()}</div>
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
            {sending ? <span className="spinner sm" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} /> : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}
