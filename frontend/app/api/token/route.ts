import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/token
 * 
 * Fetches a LiveKit access token from the backend server.
 * This endpoint should proxy requests to http://localhost:8082/token
 * 
 * Query Parameters:
 * - room: The LiveKit room name
 * - identity: The participant identity
 * 
 * Expected Response from backend:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const room = searchParams.get('room')
    const identity = searchParams.get('identity')

    if (!room || !identity) {
      return NextResponse.json(
        { error: 'Missing room or identity parameter' },
        { status: 400 }
      )
    }

    // TODO: Replace with your actual backend URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8082'
    const tokenUrl = `${backendUrl}/token?room=${encodeURIComponent(
      room
    )}&identity=${encodeURIComponent(identity)}`

    console.log('[v0] Fetching token from:', tokenUrl)

    const response = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('[v0] Token fetch failed:', response.statusText)
      return NextResponse.json(
        { error: 'Failed to get access token from backend' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Token endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
