'use client'

import { useEffect, useRef, useState } from 'react'

interface AvatarProps {
  isConnected: boolean
}

export default function Avatar({ isConnected }: AvatarProps) {
  const [mouthOpen, setMouthOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isConnected) {
      // Simulate lip movement while speaking
      intervalRef.current = setInterval(() => {
        setMouthOpen((prev) => !prev)
      }, 350) // adjust speed as needed
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setMouthOpen(false)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isConnected])

  return (
    <div className="relative bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-700">
      <div className="text-center">
        {/* Animated SVG face */}
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
          {/* Face */}
          <circle cx="70" cy="70" r="60" fill="#FFD1A9" stroke="#333" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="50" cy="55" r="7" fill="#333" />
          <circle cx="90" cy="55" r="7" fill="#333" />
          <circle cx="52" cy="55" r="3" fill="white" />
          <circle cx="92" cy="55" r="3" fill="white" />
          {/* Eyebrows */}
          <line x1="40" y1="42" x2="60" y2="45" stroke="#333" strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="42" x2="80" y2="45" stroke="#333" strokeWidth="3" strokeLinecap="round" />
          {/* Mouth */}
          {isConnected ? (
            <ellipse
              cx="70"
              cy="90"
              rx="25"
              ry={mouthOpen ? 18 : 6}
              fill="#B35C44"
              stroke="#333"
              strokeWidth="2"
              style={{ transition: 'ry 0.2s ease' }}
            />
          ) : (
            <ellipse cx="70" cy="90" rx="25" ry="6" fill="#B35C44" stroke="#333" strokeWidth="2" />
          )}
        </svg>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          {isConnected ? '🔊 Speaking...' : 'Avatar ready'}
        </p>
      </div>
    </div>
  )
}