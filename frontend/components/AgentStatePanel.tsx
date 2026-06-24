'use client'

import { ToolCall } from '@/lib/livekit'
import { CheckCircle2, Clock, Wrench } from 'lucide-react'

interface AgentStatePanelProps {
  toolCalls: ToolCall[]
}

// The complete list of tools your agent can use
const AVAILABLE_TOOLS = [
  { name: 'identify_user', description: 'Check if a patient exists by phone' },
  { name: 'register_user', description: 'Create a new patient profile' },
  { name: 'fetch_slots', description: 'Get available appointment slots' },
  { name: 'book_appointment', description: 'Book a confirmed appointment' },
  { name: 'retrieve_appointments', description: 'List all appointments for a patient' },
  { name: 'cancel_appointment', description: 'Cancel an existing appointment' },
  { name: 'modify_appointment', description: 'Reschedule an appointment' },
  { name: 'end_conversation', description: 'End the call gracefully' },
]

export default function AgentStatePanel({ toolCalls }: AgentStatePanelProps) {
  // If we have tool calls, show them
  if (toolCalls.length > 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 text-blue-600 dark:text-blue-400">
          🔧 Tool Calls
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {toolCalls.map((tool, idx) => (
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
          ))}
        </div>
      </div>
    )
  }

  // Otherwise, show the list of available tools
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
        <Wrench size={16} /> Available Tools
      </h3>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {AVAILABLE_TOOLS.map((tool) => (
          <div
            key={tool.name}
            className="p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-xs"
          >
            <p className="font-mono font-semibold text-slate-700 dark:text-slate-200">
              {tool.name}
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              {tool.description}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 italic">
        These tools are called automatically during conversation.
      </p>
    </div>
  )
}