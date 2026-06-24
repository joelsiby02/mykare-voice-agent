'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { Room } from 'livekit-client'
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

      // Room name must match a pattern that has a dispatch rule.
      // Use 'console-demo' – we'll keep it consistent.
      const roomName = 'console-demo'
      const token = await getAccessToken(roomName, `user-${Date.now()}`)

      if (!liveKitUrl) {
        throw new Error('LiveKit URL is not configured')
      }

      const room = await connectToRoom(liveKitUrl, token, roomName, {
        audio: true,
        video: false,
      })

      if (!room) {
        throw new Error('Failed to connect to room')
      }

      // 🔧 FIX: Enable microphone explicitly and log
      await room.localParticipant.setMicrophoneEnabled(true)
      console.log('[Mic] enabled:', room.localParticipant.isMicrophoneEnabled)
      console.log('[Mic] Audio publications:', room.localParticipant.audioTrackPublications)

      setupRoomListeners(
        room,
        (toolCall: ToolCall) => {
          console.log('Tool call received:', toolCall)
          setToolCalls((prev) => [...prev, toolCall])
          setTranscript((prev) => [
            ...prev,
            { speaker: 'System', text: `🔧 Tool called: ${toolCall.toolName}`, timestamp: Date.now() },
          ])
        },
        (speaker: string, text: string) => {
          console.log(`${speaker}: ${text}`)
          const entry: TranscriptEntry = { speaker, text, timestamp: Date.now() }
          setTranscript((prev) => [...prev, entry])
          transcriptRef.current += `\n${speaker}: ${text}`
        }
      )

      roomRef.current = room
      setCallStatus('connected')
    } catch (error) {
      console.error('Error starting call:', error)
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
    </>
  )
}