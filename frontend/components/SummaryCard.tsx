'use client'

import { Button } from '@/components/ui/button'
import { X, Download, Calendar } from 'lucide-react'
import { CallSummary } from '@/lib/livekit'

interface SummaryCardProps {
  summary: CallSummary | null
  onClose: () => void
  isLoading?: boolean
}

export default function SummaryCard({
  summary,
  onClose,
  isLoading = false,
}: SummaryCardProps) {
  if (!summary) return null

  const handleDownload = () => {
    const content = `Call Summary
Generated: ${summary.timestamp}

${summary.summary}

Appointments Mentioned:
${summary.appointments
  .map(
    (apt) =>
      `- Date: ${apt.date}, Time: ${apt.time}${apt.type ? `, Type: ${apt.type}` : ''}`
  )
  .join('\n')}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call-summary-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Call Summary</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close summary"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Summary Text */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                  {summary.summary}
                </p>
              </div>

              {/* Appointments */}
              {summary.appointments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                    Appointments Mentioned
                  </h3>
                  <div className="space-y-2">
                    {summary.appointments.map((apt, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg"
                      >
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                          {apt.date} at {apt.time}
                        </p>
                        {apt.type && (
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Type: {apt.type}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Generated: {new Date(summary.timestamp).toLocaleString()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Download size={18} />
                  Download Summary
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
