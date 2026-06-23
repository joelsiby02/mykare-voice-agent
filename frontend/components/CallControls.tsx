'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'

type CallStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface CallControlsProps {
  onStartCall: () => Promise<void>
  onEndCall: () => Promise<void>
  onToggleMute: () => void
  status: CallStatus
  isMuted: boolean
  isLoading?: boolean
}

export default function CallControls({
  onStartCall,
  onEndCall,
  onToggleMute,
  status,
  isMuted,
  isLoading = false,
}: CallControlsProps) {
  const [localLoading, setLocalLoading] = useState(false)

  const handleStartCall = useCallback(async () => {
    try {
      setLocalLoading(true)
      await onStartCall()
    } catch (error) {
      console.error('Error starting call:', error)
    } finally {
      setLocalLoading(false)
    }
  }, [onStartCall])

  const handleEndCall = useCallback(async () => {
    try {
      setLocalLoading(true)
      await onEndCall()
    } catch (error) {
      console.error('Error ending call:', error)
    } finally {
      setLocalLoading(false)
    }
  }, [onEndCall])

  const isCallActive = status === 'connected' || status === 'connecting'

  return (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Status Display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Call Status</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting'
                  ? 'bg-yellow-500'
                  : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
          <span
            className={`text-sm font-semibold capitalize ${
              status === 'connected'
                ? 'text-green-600 dark:text-green-400'
                : status === 'connecting'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : status === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isCallActive ? (
          <Button
            onClick={handleStartCall}
            disabled={localLoading || isLoading || status === 'connecting'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Phone size={18} />
            {localLoading || isLoading ? 'Starting...' : 'Start Call'}
          </Button>
        ) : (
          <>
            <Button
              onClick={onToggleMute}
              disabled={localLoading || isLoading}
              variant="outline"
              className={`flex-1 gap-2 ${
                isMuted
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
              }`}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>

            <Button
              onClick={handleEndCall}
              disabled={localLoading || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <PhoneOff size={18} />
              End Call
            </Button>
          </>
        )}
      </div>

      {/* Connection Info */}
      {status === 'connecting' && (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Connecting to healthcare agent...
        </p>
      )}
    </div>
  )
}
