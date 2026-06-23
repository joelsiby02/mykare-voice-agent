import {
  Room,
  RoomOptions,
  Participant,
  ParticipantEvent,
  RoomEvent,
  DataPacket_Kind,
  LocalParticipant,
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
    const response = await fetch(
      `/api/token?room=${encodeURIComponent(room)}&identity=${encodeURIComponent(
        identity
      )}`
    )

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

export async function getCallSummary(transcript: string): Promise<CallSummary> {
  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get call summary: ${response.statusText}`)
    }

    const summary = await response.json()
    return summary
  } catch (error) {
    console.error('Error getting call summary:', error)
    throw error
  }
}

export function connectToRoom(
  url: string,
  token: string,
  roomName: string,
  options?: RoomOptions
): Promise<Room> {
  const room = new Room(options)

  return room.connect(url, token)
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

  room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: RemoteParticipant) => {
    try {
      const decoder = new TextDecoder()
      const data = JSON.parse(decoder.decode(payload))

      if (data.type === 'tool_call') {
        const toolCall: ToolCall = {
          toolName: data.toolName,
          data: data.data,
          timestamp: Date.now(),
        }
        onToolCall(toolCall)
      } else if (data.type === 'transcript') {
        onTranscript(data.speaker, data.text)
      }
    } catch (error) {
      console.error('Error parsing received data:', error)
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
