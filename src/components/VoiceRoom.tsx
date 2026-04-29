'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import AgoraRTC, {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng'

interface VoiceRoomProps {
  channelName: string
  sessionId: string
  userId: string
  otherUsername: string
  onEnd: () => void
}

interface ChatMessage {
  id: string
  sender: 'me' | 'peer'
  text: string
  time: Date
}

const SESSION_DURATION = 15 * 60 // 15 minutes in seconds

export default function VoiceRoom({
  channelName,
  sessionId,
  userId,
  otherUsername,
  onEnd,
}: VoiceRoomProps) {
  // ── Voice Call State ──────────────────────────────────────────────────────
  const [client, setClient] = useState<IAgoraRTCClient | null>(null)
  const [localTrack, setLocalTrack] = useState<IMicrophoneAudioTrack | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION)
  const [joined, setJoined] = useState(false)
  const [callError, setCallError] = useState('')
  const [callUsed, setCallUsed] = useState(false)
  const [callActive, setCallActive] = useState(false)

  // ── Chat State ────────────────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState<'chat' | 'call'>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'peer',
      text: `Hey! I'm ${otherUsername} — ready to practice? 👋`,
      time: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Supabase Realtime for chat ────────────────────────────────────────────
  const getSB = useCallback(() => {
    if (typeof window === 'undefined') return null
    const { createClient } = require('@/lib/supabase/client')
    return createClient()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Supabase realtime channel for chat
  useEffect(() => {
    const sb = getSB(); if (!sb) return
    const channel = sb.channel(`session-chat-${sessionId}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'chat' }, ({ payload }: { payload: { senderId: string; text: string; msgId: string } }) => {
      if (payload.senderId !== userId) {
        setMessages(prev => [
          ...prev,
          {
            id: payload.msgId,
            sender: 'peer',
            text: payload.text,
            time: new Date(),
          },
        ])
      }
    })

    channel.subscribe()

    return () => { sb.removeChannel(channel) }
  }, [sessionId, userId, getSB])

  const sendMessage = useCallback(async () => {
    const text = inputText.trim(); if (!text) return
    const msgId = `msg-${Date.now()}`
    setMessages(prev => [...prev, { id: msgId, sender: 'me', text, time: new Date() }])
    setInputText('')

    const sb = getSB(); if (!sb) return
    const channel = sb.channel(`session-chat-${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'chat',
      payload: { senderId: userId, text, msgId },
    })
  }, [inputText, sessionId, userId, getSB])

  // ── End Session ───────────────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    if (localTrack) { localTrack.stop(); localTrack.close() }
    if (client) { await client.leave() }
    await fetch('/api/sessions/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId }),
    })
    onEnd()
  }, [localTrack, client, sessionId, userId, onEnd])

  // ── Countdown Timer (only when call is active) ────────────────────────────
  useEffect(() => {
    if (!callActive) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          endSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [callActive, endSession])

  // ── Join Agora Voice ──────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    if (callUsed) return
    setCallUsed(true)
    setCallActive(true)
    setActivePanel('call')
    try {
      const rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      setClient(rtcClient)

      rtcClient.on('user-published', async (user, mediaType) => {
        await rtcClient.subscribe(user, mediaType)
        if (mediaType === 'audio') user.audioTrack?.play()
        setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user])
      })
      rtcClient.on('user-unpublished', user => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid))
      })
      rtcClient.on('user-left', user => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid))
      })

      const uid = Math.abs(
        userId.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
      ) % 1000000

      await rtcClient.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channelName,
        null,
        uid
      )

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      setLocalTrack(audioTrack)
      await rtcClient.publish([audioTrack])
      setJoined(true)
    } catch (err) {
      setCallError('Failed to join voice room. Please check microphone permissions.')
      console.error(err)
    }
  }, [callUsed, channelName, userId])

  const toggleMute = async () => {
    if (localTrack) {
      await localTrack.setEnabled(isMuted)
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = ((SESSION_DURATION - timeLeft) / SESSION_DURATION) * 100
  const formatMsgTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="modal-overlay">
      <div className="session-room">
        {/* ── Header ── */}
        <div className="session-room-header">
          <div className="session-peer-info">
            <div className="session-peer-avatar">{otherUsername.slice(0, 2).toUpperCase()}</div>
            <div>
              <span className="session-peer-name">{otherUsername}</span>
              <span className="live-badge">● LIVE</span>
            </div>
          </div>
          <button className="session-end-btn" onClick={endSession} title="End session">
            End Session
          </button>
        </div>

        {/* ── Panel Tabs ── */}
        <div className="session-tabs">
          <button
            className={`session-tab${activePanel === 'chat' ? ' active' : ''}`}
            onClick={() => setActivePanel('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`session-tab${activePanel === 'call' ? ' active' : ''}`}
            onClick={() => setActivePanel('call')}
          >
            🎙️ Voice Call
            {callUsed && <span className="call-used-tag">used</span>}
          </button>
        </div>

        {/* ── Chat Panel ── */}
        {activePanel === 'chat' && (
          <div className="chat-panel">
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                  <div className="chat-bubble">
                    <span className="chat-text">{msg.text}</span>
                  </div>
                  <span className="chat-time">{formatMsgTime(msg.time)}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-row">
              <input
                className="chat-input"
                type="text"
                placeholder="Type a message…"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                maxLength={500}
              />
              <button className="chat-send-btn" onClick={sendMessage} disabled={!inputText.trim()}>
                ➤
              </button>
            </div>
          </div>
        )}

        {/* ── Voice Call Panel ── */}
        {activePanel === 'call' && (
          <div className="call-panel">
            {!callUsed && !callActive && (
              <div className="call-intro">
                <div className="call-intro-icon">🎙️</div>
                <h3 className="call-intro-title">15-Minute Voice Call</h3>
                <p className="call-intro-desc">
                  You have <strong>1 voice call</strong> per session. Once started, the 15-minute
                  timer begins. Use it wisely!
                </p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={startCall}>
                  Start Voice Call 🎙️
                </button>
                <p className="call-note">Non-refundable · 1 use only per session</p>
              </div>
            )}

            {callActive && (
              <>
                <div className="timer-ring">
                  <svg viewBox="0 0 120 120" className="timer-svg">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#f4f4f5" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke={timeLeft < 120 ? '#ef4444' : '#18181b'}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercent / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                    />
                  </svg>
                  <div className="timer-text">
                    <span className="timer-time" style={{ color: timeLeft < 120 ? '#ef4444' : '#18181b' }}>
                      {formatTime(timeLeft)}
                    </span>
                    <span className="timer-label">remaining</span>
                  </div>
                </div>

                <div className="participants">
                  <div className="participant">
                    <div className={`participant-avatar${joined ? ' speaking' : ''}`}>You</div>
                    <span className="participant-name">You {isMuted ? '🔇' : '🎙️'}</span>
                  </div>
                  <div className="participant-separator">⟷</div>
                  <div className="participant">
                    <div className={`participant-avatar${remoteUsers.length > 0 ? ' speaking' : ''}`}>
                      {otherUsername.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="participant-name">{otherUsername}</span>
                  </div>
                </div>

                {!joined && !callError && <p className="voice-connecting">Connecting to voice…</p>}
                {callError && <p className="form-error">{callError}</p>}

                <div className="voice-controls">
                  <button
                    className={`voice-btn${isMuted ? ' muted' : ''}`}
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? '🔇' : '🎙️'}
                  </button>
                  <button className="voice-btn end" onClick={endSession} title="End Call">
                    📵
                  </button>
                </div>
                <p className="voice-note">Session auto-ends at 15 minutes · Be respectful</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
