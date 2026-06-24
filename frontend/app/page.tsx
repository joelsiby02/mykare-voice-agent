'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { Room, RoomEvent, Track, RemoteParticipant } from 'livekit-client'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import CallControls from '@/components/CallControls'
import AgentStatePanel from '@/components/AgentStatePanel'
import SummaryCard from '@/components/SummaryCard'
import Avatar from '@/components/Avatar'
import PortfolioSection from '@/components/PortfolioSection'
import Footer from '@/components/Footer'
import {
  getAccessToken,
  connectToRoom,
  setupRoomListeners,
  getCallSummary,
  ToolCall,
  CallSummary,
} from '@/lib/livekit'

type CallStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface TranscriptEntry {
  speaker: string
  text: string
  timestamp: number
}

export default function Home() {
  const [callStatus, setCallStatus] = useState<CallStatus>('disconnected')
  const [isMuted, setIsMuted] = useState(false)
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [summary, setSummary] = useState<CallSummary | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  const roomRef = useRef<Room | null>(null)
  const transcriptRef = useRef<string>('')
  const audioRef = useRef<HTMLAudioElement>(null)

  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL
  if (!liveKitUrl) {
    console.error('NEXT_PUBLIC_LIVEKIT_URL environment variable is not set')
  }

  const handleStartCall = useCallback(async () => {
    try {
      setCallStatus('connecting')
      setToolCalls([])
      setTranscript([])
      transcriptRef.current = ''

      const roomName = `console-demo-${Date.now()}`
      const token = await getAccessToken(roomName, `user-${Date.now()}`)

      if (!liveKitUrl) {
        throw new Error('LiveKit URL is not configured')
      }

      console.log('[Frontend] Creating room with options:', { audio: true, video: false })
      const room = await connectToRoom(liveKitUrl, token, roomName, {
        audio: true,
        video: false,
      })

      if (!room) {
        throw new Error('Failed to connect to room')
      }

      // --- Event listeners for debugging ---
      room.on(RoomEvent.Connected, () => {
        console.log('[Frontend] ✅ Room connected successfully')
        setCallStatus('connected')
      })

      room.on(RoomEvent.Disconnected, (reason?: string) => {
        console.warn('[Frontend] ⚠️ Room disconnected, reason:', reason || 'unknown')
        setCallStatus('disconnected')
      })

      room.on(RoomEvent.Reconnecting, () => {
        console.log('[Frontend] 🔄 Reconnecting...')
      })

      room.on(RoomEvent.Reconnected, () => {
        console.log('[Frontend] ✅ Reconnected')
      })

      // Listen for when the agent publishes audio
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('[Frontend] Track subscribed:', track.kind, participant.identity, track.sid)
        if (track.kind === Track.Kind.Audio && participant.isAgent) {
          console.log('[Frontend] Agent audio track received, playing...')
          const audioElement = audioRef.current
          if (audioElement) {
            audioElement.srcObject = new MediaStream([track.mediaStreamTrack])
            audioElement.play().catch(e => {
              console.warn('[Frontend] Autoplay blocked, need user interaction', e)
            })
          } else {
            // fallback
            const newAudio = new Audio()
            newAudio.srcObject = new MediaStream([track.mediaStreamTrack])
            newAudio.play().catch(e => console.warn('[Frontend] Autoplay blocked', e))
          }
        }
      })

      // Enable microphone
      try {
        await room.localParticipant.setMicrophoneEnabled(true)
        console.log('[Frontend] Mic enabled:', room.localParticipant.isMicrophoneEnabled)
        console.log('[Frontend] Audio publications:', room.localParticipant.audioTrackPublications)
      } catch (micError) {
        console.error('[Frontend] Failed to enable microphone:', micError)
        // Continue anyway
      }

      // --- DEBUG: Listen for any raw data coming from the agent ---
      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: RemoteParticipant) => {
        try {
          const decoder = new TextDecoder()
          const data = JSON.parse(decoder.decode(payload))
          console.log('[Frontend] 📨 Data received (raw):', data)
          // If the data has a type 'transcript', we'll handle it in the setupRoomListeners,
          // but we can also forward it here if needed.
        } catch (error) {
          console.error('[Frontend] Error parsing data channel message:', error)
        }
      })

      // Also log metadata changes directly
      room.localParticipant.on('metadataChanged', (metadata: string) => {
        console.log('[Frontend] 📝 Metadata changed (raw):', metadata)
        // The setupRoomListeners will also handle this, but we log it here for visibility.
        try {
          const payload = JSON.parse(metadata)
          const toolCall: ToolCall = {
            toolName: payload.intent || 'unknown',
            data: payload.extracted_data || {},
            timestamp: Date.now(),
          }
          // Update UI directly (also done in setupRoomListeners, but this is extra)
          setToolCalls((prev) => [...prev, toolCall])
          setTranscript((prev) => [
            ...prev,
            { speaker: 'System', text: `🔧 Tool called: ${toolCall.toolName}`, timestamp: Date.now() },
          ])
        } catch (error) {
          console.error('[Frontend] Error parsing metadata:', error)
        }
      })

      // Setup the official listeners (tool calls and transcript)
      setupRoomListeners(
        room,
        (toolCall: ToolCall) => {
          console.log('[Frontend] Tool call received (from setup):', toolCall)
          setToolCalls((prev) => [...prev, toolCall])
          setTranscript((prev) => [
            ...prev,
            { speaker: 'System', text: `🔧 Tool called: ${toolCall.toolName}`, timestamp: Date.now() },
          ])
        },
        (speaker: string, text: string) => {
          console.log(`[Frontend] Transcript: ${speaker}: ${text}`)
          const entry: TranscriptEntry = { speaker, text, timestamp: Date.now() }
          setTranscript((prev) => [...prev, entry])
          transcriptRef.current += `\n${speaker}: ${text}`
        }
      )

      roomRef.current = room
      // Status will be updated by the 'Connected' event
    } catch (error) {
      console.error('[Frontend] Error starting call:', error)
      setCallStatus('error')
      setTimeout(() => setCallStatus('disconnected'), 3000)
    }
  }, [liveKitUrl])

  const handleEndCall = useCallback(async () => {
    try {
      setCallStatus('connecting')

      if (roomRef.current) {
        await roomRef.current.disconnect()
        roomRef.current = null
      }

      setIsLoadingSummary(true)
      try {
        const callSummary = await getCallSummary(transcriptRef.current)
        setSummary(callSummary)
        setShowSummary(true)
      } catch (error) {
        console.error('Error fetching summary:', error)
        setSummary({
          summary: 'Call ended. Summary generation failed.',
          appointments: [],
          timestamp: new Date().toISOString(),
        })
        setShowSummary(true)
      } finally {
        setIsLoadingSummary(false)
      }

      setCallStatus('disconnected')
    } catch (error) {
      console.error('Error ending call:', error)
      setCallStatus('error')
    }
  }, [])

  const handleToggleMute = useCallback(() => {
    if (roomRef.current?.localParticipant?.audioTrackPublications) {
      roomRef.current.localParticipant.audioTrackPublications.forEach((pub) => {
        if (pub.track) {
          pub.track.muted = !isMuted
        }
      })
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect()
      }
    }
  }, [])

  return (
    <>
      <Header />
      <HeroSection />
      <section
        id="call-interface"
        className="py-16 md:py-24 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Start Your Call
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Connect with Nova and experience the future of healthcare scheduling
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <CallControls
                onStartCall={handleStartCall}
                onEndCall={handleEndCall}
                onToggleMute={handleToggleMute}
                status={callStatus}
                isMuted={isMuted}
                isLoading={isLoadingSummary}
              />
              <Avatar isConnected={callStatus === 'connected'} />
            </div>
            <div className="lg:col-span-2">
              <AgentStatePanel toolCalls={toolCalls} transcript={transcript} />
            </div>
          </div>
        </div>
      </section>
      <PortfolioSection />
      {showSummary && (
        <SummaryCard
          summary={summary}
          isLoading={isLoadingSummary}
          onClose={() => {
            setShowSummary(false)
            setSummary(null)
          }}
        />
      )}
      <Footer />
      {/* Hidden audio element for agent audio */}
      <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
    </>
  )
}