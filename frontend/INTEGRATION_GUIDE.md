# Backend Integration Guide

This document explains how to integrate this frontend with your voice-based AI healthcare agent backend.

## Backend Requirements

Your backend service should implement the following APIs:

### 1. Token Generation Endpoint

**Endpoint:** `GET /token`

**Purpose:** Generate LiveKit JWT tokens for the frontend to authenticate and join the call room.

**Query Parameters:**
```
room=<string>       // Room name (e.g., "healthcare-assistant")
identity=<string>   // Unique participant identity (e.g., "user-1718876000")
```

**Example Request:**
```
GET http://localhost:8082/token?room=healthcare-assistant&identity=user-1718876000
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWQiOiAiVkdQcHZLY0dwRzAiLCAic3ViIjogInVzZXItMTcxODg3NjAwMCIsICJpYXQiOiAxNzE4ODc2MDAwLCAiZXhwIjogMTcxODg3NjYwMH0.8S2JKqqSh9WkVlKg6mDXB5hC"
}
```

**Token Format:**
The token should be a JWT signed by your LiveKit server that includes:
- `sid`: Session ID
- `sub`: Participant identity
- `iat`: Issued at time
- `exp`: Expiration time

### 2. Summary Generation Endpoint

**Endpoint:** `POST /summary`

**Purpose:** Process the call transcript and extract conversation summary and appointment information.

**Request Body:**
```json
{
  "transcript": "Agent: How can I help you today?\nUser: I'd like to book a checkup appointment..."
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8082/summary \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Agent: Hello...\nUser: I need an appointment"}'
```

**Expected Response:**
```json
{
  "summary": "The user called to book a general checkup appointment on June 24th at 4:00 PM with Dr. Smith.",
  "appointments": [
    {
      "date": "2024-06-24",
      "time": "4:00 PM",
      "type": "General Checkup"
    }
  ],
  "timestamp": "2024-06-20T10:30:00Z"
}
```

**Response Fields:**
- `summary` (string): Natural language summary of the call
- `appointments` (array): List of appointments mentioned or booked
  - `date` (string): Appointment date (ISO format preferred)
  - `time` (string): Appointment time
  - `type` (string, optional): Type of appointment
- `timestamp` (string): When the summary was generated (ISO 8601 format)

## LiveKit Room Communication

Once the frontend connects to a LiveKit room, your backend should:

### 1. Join the Room
Your AI agent should join the same room when the frontend initiates a call.

### 2. Send Tool Call Events

When your agent makes a function call, send it to the frontend via the LiveKit data channel:

**Event Format:**
```json
{
  "type": "tool_call",
  "toolName": "fetch_slots",
  "data": {
    "date": "2024-06-24",
    "provider": "Dr. Smith",
    "duration": 30
  }
}
```

**Supported Tool Names (Examples):**
- `identify_user` - Extracted user information
- `fetch_slots` - Available appointment slots
- `book_appointment` - Appointment booking action
- `send_reminder` - Reminder notifications
- Any custom tools your agent uses

**Backend Code Example (Node.js):**
```javascript
// Send tool call event
const encoder = new TextEncoder();
const payload = encoder.encode(JSON.stringify({
  type: 'tool_call',
  toolName: 'book_appointment',
  data: {
    date: '2024-06-24',
    time: '4:00 PM',
    type: 'General Checkup'
  }
}));

await room.localParticipant.publishData(payload, DataPacket_Kind.LOSSY);
```

### 3. Send Transcript Events

Send conversation transcript updates as they occur:

**Event Format:**
```json
{
  "type": "transcript",
  "speaker": "Agent",
  "text": "How can I help you today?"
}
```

**Speakers:**
- `"Agent"` - Messages from your AI agent
- `"User"` - Messages from the user
- Other identifiers if using multiple participants

**Backend Code Example:**
```javascript
const transcriptEvent = {
  type: 'transcript',
  speaker: 'User',
  text: 'I need to book an appointment'
};

const encoder = new TextEncoder();
const payload = encoder.encode(JSON.stringify(transcriptEvent));
await room.localParticipant.publishData(payload, DataPacket_Kind.LOSSY);
```

## Audio Handling

The frontend enables audio-only communication:

```typescript
const room = await connectToRoom(url, token, roomName, {
  audio: true,    // Enable microphone
  video: false    // No video by default
})
```

Your backend should:
1. Receive audio from the user via LiveKit
2. Process speech-to-text (ASR)
3. Generate agent responses with text-to-speech (TTS)
4. Send audio back through LiveKit
5. Emit transcript and tool call events alongside audio

## Environment Configuration

### Frontend Configuration
Set these in your `.env.local`:

```env
NEXT_PUBLIC_LIVEKIT_URL=http://localhost:7880
BACKEND_URL=http://localhost:8082
```

### Backend Configuration
Your backend should expose:
- LiveKit server connection
- Token generation service
- Summary generation service
- Optional: Avatar video streaming endpoint

## Sample Backend Workflow

```
1. Frontend calls "Start Call"
   ↓
2. Frontend requests token from /api/token
   ↓
3. Your backend generates JWT token for LiveKit
   ↓
4. Frontend connects to LiveKit room with token
   ↓
5. Your AI agent joins the same room
   ↓
6. User speaks (audio transmitted via LiveKit)
   ↓
7. Your backend:
   - Receives audio
   - Runs ASR to get text
   - Sends transcript event: { type: 'transcript', speaker: 'User', text: '...' }
   - Processes with AI to generate response
   - Calls tools and sends: { type: 'tool_call', toolName: '...', data: {...} }
   - Generates TTS response
   - Sends transcript event: { type: 'transcript', speaker: 'Agent', text: '...' }
   - Sends audio back via LiveKit
   ↓
8. User ends call
   ↓
9. Frontend sends full transcript to POST /api/summary
   ↓
10. Your backend generates summary and returns appointments
   ↓
11. Frontend displays summary modal
```

## Testing

### Mock Backend
For testing without a real backend, you can mock the endpoints:

**Mock Token Endpoint:**
```javascript
// app/api/token/route.ts
export async function GET(request: NextRequest) {
  // Return a dummy token for testing
  return NextResponse.json({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
}
```

**Mock Summary Endpoint:**
```javascript
// app/api/summary/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  return NextResponse.json({
    summary: 'Mock call summary: User booked appointment for June 24.',
    appointments: [{
      date: '2024-06-24',
      time: '4:00 PM',
      type: 'General Checkup'
    }],
    timestamp: new Date().toISOString()
  })
}
```

### Simulating Tool Calls
To test the UI without a real agent:

```javascript
// In app/page.tsx handleStartCall
useEffect(() => {
  if (callStatus === 'connected') {
    // Simulate a tool call after 2 seconds
    const timer = setTimeout(() => {
      setToolCalls(prev => [...prev, {
        toolName: 'identify_user',
        data: { name: 'John Doe', phone: '555-1234' },
        timestamp: Date.now()
      }])
    }, 2000)
    
    return () => clearTimeout(timer)
  }
}, [callStatus])
```

## Avatar Integration

The frontend includes a placeholder for avatar video. To integrate with Tavus/Beyond Presence:

1. **Get video stream from backend:**
```javascript
// In app/page.tsx
const videoElement = document.querySelector('video')
if (videoElement && roomRef.current?.participants) {
  const agent = roomRef.current.participants.get('agent')
  if (agent?.videoTrackSubscriptions.size) {
    const videoTrack = agent.videoTrackSubscriptions.values().next().value
    videoElement.srcObject = videoTrack.mediaStream
  }
}
```

2. **Enable video in call:**
```javascript
const room = await connectToRoom(url, token, roomName, {
  audio: true,
  video: true  // Enable video
})
```

3. **Backend should:**
   - Run avatar generation service
   - Stream video to frontend participant
   - Sync lip-sync with audio/transcript events

## Error Handling

The frontend handles errors gracefully:

- **Connection errors** → Status shows "Error" and reverts to "Disconnected"
- **Token fetch errors** → Console error, connection fails
- **Summary generation errors** → Shows default message with available data

Ensure your backend:
- Returns appropriate HTTP status codes
- Provides error messages in response bodies
- Handles malformed requests
- Implements request validation

## CORS Configuration

If running on different domains, ensure CORS is configured:

**Backend CORS Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
```

## Security Considerations

1. **Token Validation:** Ensure tokens expire and cannot be reused
2. **Data Encryption:** Use HTTPS/WSS in production
3. **Rate Limiting:** Protect endpoints from abuse
4. **Input Validation:** Validate all incoming data
5. **Authentication:** Verify user identity before creating rooms
6. **Audit Logging:** Log all API calls and tool invocations

## Troubleshooting

### Connection fails immediately
- Check `NEXT_PUBLIC_LIVEKIT_URL` is correct and accessible from browser
- Verify backend is running
- Check network connectivity

### No audio transmission
- Ensure microphone permission is granted
- Check browser console for audio device errors
- Verify LiveKit room audio permissions

### No transcript appearing
- Ensure backend is sending `{ type: 'transcript', ... }` events
- Check data channel is open: monitor with LiveKit console
- Verify format matches expected JSON structure

### No tool calls visible
- Check backend is sending `{ type: 'tool_call', ... }` events
- Verify payload is proper JSON
- Monitor network tab for LiveKit data messages

### Summary generation fails
- Check `/api/summary` endpoint is responding
- Verify transcript is being captured
- Check backend `/summary` endpoint for errors

## Support

For integration support:
1. Check browser DevTools Console for errors
2. Monitor LiveKit console for room/connection state
3. Inspect network requests in Network tab
4. Review backend logs for API errors
5. Verify environment variables are set correctly
