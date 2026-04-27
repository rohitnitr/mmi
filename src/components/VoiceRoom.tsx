'use client'

import { useEffect, useState, useCallback } from 'react'
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

const SESSION_DURATION = 15 * 60 // 15 minutes in seconds

export default function VoiceRoom({
  channelName,
  sessionId,
  userId,
  otherUsername,
  onEnd,
}: VoiceRoomProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null)
  const [localTrack, setLocalTrack] = useState<IMicrophoneAudioTrack | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')

  const endSession = useCallback(async () => {
    if (localTrack) {
      localTrack.stop()
      localTrack.close()
    }
    if (client) {
      await client.leave()
    }
    await fetch('/api/sessions/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId }),
    })
    onEnd()
  }, [localTrack, client, sessionId, userId, onEnd])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          endSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [endSession])

  // Join Agora
  useEffect(() => {
    const join = async () => {
      try {
        const rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        setClient(rtcClient)

        rtcClient.on('user-published', async (user, mediaType) => {
          await rtcClient.subscribe(user, mediaType)
          if (mediaType === 'audio') {
            user.audioTrack?.play()
          }
          setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== user.uid), user])
        })

        rtcClient.on('user-unpublished', (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
        })

        rtcClient.on('user-left', (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
        })

        // Use user ID as UID (truncate to number)
        const uid = Math.abs(
          userId.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
        ) % 1000000

        await rtcClient.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channelName,
          null, // token – use null for testing, implement token server for production
          uid
        )

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        setLocalTrack(audioTrack)
        await rtcClient.publish([audioTrack])
        setJoined(true)
      } catch (err) {
        setError('Failed to join voice room. Please check microphone permissions.')
        console.error(err)
      }
    }

    join()

    return () => {
      localTrack?.stop()
      localTrack?.close()
      client?.leave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, userId])

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

  return (
    <div className="modal-overlay">
      <div className="voice-room">
        <div className="voice-room-header">
          <span className="live-badge">● LIVE</span>
          <h2 className="voice-title">Mock Interview Session</h2>
          <p className="voice-subtitle">with {otherUsername}</p>
        </div>

        <div className="timer-ring">
          <svg viewBox="0 0 120 120" className="timer-svg">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f4f4f5" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
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

        {!joined && !error && (
          <p className="voice-connecting">Connecting to voice room…</p>
        )}

        {error && <p className="form-error">{error}</p>}

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
      </div>
    </div>
  )
}
