'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Avatar Component
 * 
 * This component displays the Nova AI agent's video avatar.
 * It's designed to integrate with Tavus/Beyond Presence SDK for
 * lip-sync enabled animated avatars.
 * 
 * TODO: Initialize Tavus/Beyond Presence SDK with the remote audio track from LiveKit
 */

interface AvatarProps {
  isConnected?: boolean
}

export default function Avatar({ isConnected = false }: AvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(!isConnected)

  useEffect(() => {
    setIsLoading(!isConnected)
  }, [isConnected])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-slate-900 flex items-center justify-center group">
        {/* Avatar Video Element */}
        <video
          id="avatar-video"
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Animated Gradient Overlay (pulse effect while loading) */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent animate-pulse" />
        )}

        {/* Loading State - Shows while SDK is initializing */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/40 backdrop-blur-sm">
            <div className="text-center space-y-4">
              {/* Animated Avatar Ready Badge */}
              <div className="inline-flex items-center justify-center">
                <div className="relative w-24 h-24">
                  {/* Pulsing Circle Background */}
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-30" />
                  <div className="absolute inset-2 bg-blue-400 rounded-full animate-pulse opacity-40" />
                  
                  {/* Center Circle */}
                  <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                </div>
              </div>

              {/* Avatar Status Text */}
              <div className="space-y-1">
                <p className="text-lg font-semibold text-white drop-shadow">
                  Avatar Ready
                </p>
                <p className="text-sm text-blue-50 drop-shadow">
                  Initializing Tavus/Beyond Presence
                </p>
              </div>

              {/* Loading Indicator */}
              <div className="flex gap-1 justify-center pt-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Connected State - Hide overlay when video is streaming */}
        {!isLoading && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Video Info Section */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
            Video Stream
          </p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-500'}`} />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isConnected ? 'Connected' : 'Waiting for stream...'}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Lip-sync enabled via Tavus/Beyond Presence SDK
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * TODO: Initialize Tavus/Beyond Presence SDK with the remote audio track from LiveKit
 * 
 * Example implementation:
 * 
 * import { beyondPresence } from '@beyondpresence/sdk'  // or Tavus SDK
 * 
 * useEffect(() => {
 *   if (!isConnected || !videoRef.current) return
 *   
 *   const initializeAvatar = async () => {
 *     try {
 *       // Get remote audio track from LiveKit room
 *       const audioTrack = room?.localParticipant?.audioTrackPublications?.[0]?.track?.mediaStreamTrack
 *       
 *       // Initialize Beyond Presence with avatar configuration
 *       const avatar = await beyondPresence.initialize({
 *         videoElement: videoRef.current!,
 *         audioTrack: audioTrack,
 *         avatarId: 'your-avatar-id',
 *         apiKey: process.env.NEXT_PUBLIC_BEYOND_PRESENCE_KEY,
 *       })
 *       
 *       // Set up event listeners
 *       avatar.on('ready', () => setIsLoading(false))
 *       avatar.on('error', (error) => console.error('Avatar error:', error))
 *       
 *     } catch (error) {
 *       console.error('Failed to initialize avatar:', error)
 *     }
 *   }
 *   
 *   initializeAvatar()
 * }, [isConnected, room])
 */
