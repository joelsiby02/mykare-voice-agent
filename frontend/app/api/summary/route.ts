import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/summary
 * 
 * Sends the call transcript to the backend for summarization.
 * This endpoint should proxy requests to http://localhost:8082/summary
 * 
 * Request Body:
 * {
 *   "transcript": "User: Hello...\nAgent: Hi there..."
 * }
 * 
 * Expected Response from backend:
 * {
 *   "summary": "The user called to book an appointment...",
 *   "appointments": [
 *     {
 *       "date": "2024-06-24",
 *       "time": "4:00 PM",
 *       "type": "General Checkup"
 *     }
 *   ],
 *   "timestamp": "2024-06-20T10:30:00Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript } = body

    if (!transcript) {
      return NextResponse.json(
        { error: 'Missing transcript in request body' },
        { status: 400 }
      )
    }

    // TODO: Replace with your actual backend URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8082'
    const summaryUrl = `${backendUrl}/summary`

    console.log('[v0] Sending transcript to backend for summarization')

    const response = await fetch(summaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    })

    if (!response.ok) {
      console.error('[v0] Summary fetch failed:', response.statusText)
      return NextResponse.json(
        { error: 'Failed to get summary from backend' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Ensure timestamp is present
    const summary = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[v0] Summary endpoint error:', error)

    // Return a graceful error response with defaults
    return NextResponse.json(
      {
        summary: 'Call ended. Unable to generate summary at this time.',
        appointments: [],
        timestamp: new Date().toISOString(),
      },
      { status: 200 } // Return 200 so the frontend can still show something
    )
  }
}
