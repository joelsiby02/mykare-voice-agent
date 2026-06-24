'use client'

import { ToolCall } from '@/lib/livekit'
import { CheckCircle2, Clock } from 'lucide-react'

interface AgentStatePanelProps {
  toolCalls: ToolCall[]
}

export default function AgentStatePanel({ toolCalls }: AgentStatePanelProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 text-blue-600 dark:text-blue-400">
        🔧 Tool Calls
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {toolCalls.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Waiting for agent actions...
          </p>
        ) : (
          toolCalls.map((tool, idx) => (
            <div
              key={idx}
              className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                    {tool.toolName}
                  </p>
                  {Object.entries(tool.data).some(([_, v]) => v !== 'None' && v !== '') && (
                    <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-0.5">
                      {Object.entries(tool.data)
                        .filter(([_, v]) => v !== 'None' && v !== '')
                        .map(([key, value]) => (
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
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(tool.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}