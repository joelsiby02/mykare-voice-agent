'use client'

import { useEffect, useRef } from 'react'
import { ToolCall } from '@/lib/livekit'
import { CheckCircle2, Clock } from 'lucide-react'

interface TranscriptEntry {
  speaker: string
  text: string
  timestamp: number
}

interface AgentStatePanelProps {
  toolCalls: ToolCall[]
  transcript: TranscriptEntry[]
}

export default function AgentStatePanel({
  toolCalls,
  transcript,
}: AgentStatePanelProps) {
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  return (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-[600px]">
      {/* Tool Calls Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 text-blue-600 dark:text-blue-400">
          Tool Calls
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {toolCalls.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Waiting for agent actions...
            </p>
          ) : (
            toolCalls.map((tool, idx) => (
              <div
                key={idx}
                className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                      {tool.toolName}
                    </p>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                      {Object.entries(tool.data).map(([key, value]) => (
                        <div key={key} className="truncate">
                          <span className="font-medium">{key}:</span>{' '}
                          <span>
                            {typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(tool.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-700" />

      {/* Transcript Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 text-blue-600 dark:text-blue-400">
          Transcript
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2">
          {transcript.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Waiting for conversation to start...
            </p>
          ) : (
            <>
              {transcript.map((entry, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {entry.speaker}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 p-2 rounded border border-slate-100 dark:border-slate-600">
                    {entry.text}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
