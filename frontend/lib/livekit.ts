import {
  Room,
  RoomOptions,
  Participant,
  RoomEvent,
  DataPacket_Kind,
  RemoteParticipant,
} from 'livekit-client'

export interface ToolCall {
  toolName: string
  data: Record<string, any>
  timestamp: number
}

export interface AgentState {
  toolCalls: ToolCall[]
  transcript: Array<{
    speaker: string
    text: string
    timestamp: number
  }>
}

export interface CallSummary {
  summary: string
  appointments: Array<{
    date: string
    time: string
    type?: string
  }>
  timestamp: string
}

export async function getAccessToken(
  room: string,
  identity: string
): Promise<string> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8082'
    const url = `${backendUrl}/api/token?room=${encodeURIComponent(room)}&identity=${encodeURIComponent(identity)}`

    console.log('[LiveKit] Fetching token from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const { token } = await response.json()
    return token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

export async function getCallSummary(transcript: string) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8082'
  const url = `${backendUrl}/api/summary`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get summary: ${response.statusText}`)
  }

  return response.json()
}

export async function connectToRoom(
  url: string,
  token: string,
  roomName: string,
  options?: RoomOptions
): Promise<Room> {
  const room = new Room(options)
  try {
    await room.connect(url, token)
    return room
  } catch (error) {
    console.error('Failed to connect to LiveKit room:', error)
    throw error
  }
}

export function setupRoomListeners(
  room: Room,
  onToolCall: (toolCall: ToolCall) => void,
  onTranscript: (speaker: string, text: string) => void,
  onParticipantUpdate?: (participant: Participant) => void
): void {
  room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
    console.log('Participant connected:', participant.identity)
    onParticipantUpdate?.(participant)
  })

  room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
    console.log('Participant disconnected:', participant.identity)
  })

  // Listen to metadata from the agent (tool calls)
  room.localParticipant.on('metadataChanged', (metadata: string) => {
    try {
      const payload = JSON.parse(metadata)
      const toolCall: ToolCall = {
        toolName: payload.intent || 'unknown',
        data: payload.extracted_data || {},
        timestamp: Date.now(),
      }
      onToolCall(toolCall)
    } catch (error) {
      console.error('Error parsing metadata:', error)
    }
  })

  room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: RemoteParticipant) => {
    try {
      const decoder = new TextDecoder()
      const data = JSON.parse(decoder.decode(payload))
      if (data.type === 'transcript') {
        onTranscript(data.speaker, data.text)
      }
    } catch (error) {
      console.error('Error parsing data channel message:', error)
    }
  })
}

export function sendDataToRoom(room: Room, data: any): void {
  try {
    const encoder = new TextEncoder()
    const payload = encoder.encode(JSON.stringify(data))
    room.localParticipant.publishData(payload, DataPacket_Kind.LOSSY)
  } catch (error) {
    console.error('Error sending data to room:', error)
  }
}