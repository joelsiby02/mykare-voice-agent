# Nova - AI Healthcare Receptionist Frontend

A production-ready Next.js 16 frontend for **Nova**, an intelligent voice-based AI agent designed to revolutionize healthcare appointment management. Built by [Joel Siby](https://github.com/joelsiby).

## Project Overview

Nova is a full-featured healthcare AI platform that handles:
- **24/7 Appointment Booking** - Intelligent scheduling without human intervention
- **Natural Conversation** - Advanced NLP for human-like interactions
- **Multi-language Support** - Communicate with patients in their preferred language
- **Real-time Updates** - Live transcript and agent state monitoring
- **Secure Data Handling** - HIPAA-ready architecture with Supabase integration

### Key Features

✨ **Real-time Voice Communication**
- WebSocket-based connection via LiveKit
- Bidirectional audio streaming
- Sub-second latency

🎯 **Live Agent Monitoring**
- Real-time tool call tracking (appointment bookings, cancellations, etc.)
- Live conversation transcript
- Extracted metadata display (intent, patient info, slots, etc.)

👤 **AI Avatar Integration**
- Ready for Tavus/Beyond Presence SDK integration
- Lip-sync enabled video streaming
- Professional animated avatar

🌙 **Modern UI/UX**
- Full dark/light mode support
- Responsive design (mobile → desktop)
- Accessibility compliant (WCAG AA)
- Professional healthcare branding

---

## Architecture Overview

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Real-time**: LiveKit Client SDK
- **Icons**: Lucide React
- **State Management**: React Hooks + SWR

### Backend Context (IMPORTANT)

The **Nova backend** is a **FastAPI server** running a **LiveKit Agent** that manages the AI healthcare logic. The frontend communicates with this backend through two main channels:

#### 1. LiveKit Connection
- **Protocol**: WebSocket
- **Port**: 7880 (default)
- **Purpose**: Real-time audio/video streaming between frontend and AI agent
- **Features**: Bidirectional audio, metadata streaming, state synchronization

#### 2. HTTP API Endpoints

**GET `/api/token?room=<room_id>&identity=<user_id>`**
- Returns a LiveKit access token for establishing a WebSocket connection
- Called when user clicks "Start Call"
- Token includes permissions for the specific room and identity

**POST `/api/summary`**
- Accepts the conversation transcript as JSON
- Returns a structured summary with extracted appointments, intents, and patient metadata
- Called when user ends the call
- Payload: `{ "transcript": "user: ...\nagent: ..." }`
- Response: `{ "summary": "...", "appointments": [...], "timestamp": "..." }`

#### 3. Metadata Streaming

The backend **publishes metadata via LiveKit** that the frontend listens to in real-time:

```javascript
// Frontend listens for metadata updates from the LiveKit agent
room?.localParticipant?.on('metadataChanged', (metadata) => {
  // Example metadata structure:
  // {
  //   "intent": "BOOK_APPOINTMENT",
  //   "extracted_data": {
  //     "patient_name": "John Doe",
  //     "appointment_type": "General Checkup",
  //     "preferred_date": "2024-12-15",
  //     "preferred_time": "10:00 AM"
  //   },
  //   "status": "confirmed" | "pending" | "failed"
  // }
  
  // This triggers the "Tool Calls" panel to update in real-time
  setToolCalls(prev => [...prev, { toolName: metadata.intent, data: metadata.extracted_data }])
})
```

### Database (Backend)

The backend uses **Supabase PostgreSQL** for:
- **users**: Patient and staff accounts
- **appointments**: Booking history and confirmation
- **baseline_slots**: Available time slots for scheduling
- **conversations**: Call logs and transcript storage

The frontend doesn't directly access the database—all queries go through the backend API.

---

## Setup Instructions

### Prerequisites

Before setting up, ensure you have:
- **Node.js** >= 18.x ([install](https://nodejs.org))
- **npm** or **pnpm** >= 8.x
- **Python** >= 3.10 (for the backend, if running locally)
- **LiveKit Server** running (or use [LiveKit Cloud](https://cloud.livekit.io))
- **Backend Server** running (FastAPI + LiveKit Agent)

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required: LiveKit WebSocket URL
# Example for local: http://localhost:7880
# Example for cloud: wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=http://localhost:7880

# Required: Backend API URL
# Example for local: http://localhost:8082
# Example for production: https://api.yourcompany.com
NEXT_PUBLIC_BACKEND_URL=http://localhost:8082

# Optional: Tavus/Beyond Presence API Key (for avatar integration)
# NEXT_PUBLIC_BEYOND_PRESENCE_KEY=your-api-key

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

**Where to get these values:**
- **NEXT_PUBLIC_LIVEKIT_URL**: URL of your LiveKit server (ask your backend team)
- **NEXT_PUBLIC_BACKEND_URL**: URL where the FastAPI backend is running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joelsiby/nova-healthcare-ai.git
   cd nova-healthcare-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual URLs
   nano .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Running the Backend (Optional)

If you want to run the backend locally:

```bash
# 1. Clone the backend repository
git clone https://github.com/joelsiby/nova-backend.git
cd nova-backend

# 2. Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set backend environment variables
# Create .env file in backend root with:
# LIVEKIT_URL=http://localhost:7880
# LIVEKIT_API_KEY=your-livekit-api-key
# LIVEKIT_API_SECRET=your-livekit-secret
# DATABASE_URL=postgresql://user:password@localhost/nova_db

# 5. Run the backend server
python main.py
# Server will start on http://localhost:8082
```

---

## Integration Guide

### Connecting the Avatar SDK (Tavus/Beyond Presence)

The avatar container is ready for integration with Tavus or Beyond Presence. To enable avatar streaming:

1. **Install the SDK**
   ```bash
   npm install @tavus/sdk
   # or
   npm install @beyondpresence/sdk
   ```

2. **Update environment variables**
   ```bash
   NEXT_PUBLIC_BEYOND_PRESENCE_KEY=your-api-key
   ```

3. **Implement in Avatar.tsx**
   
   Open `components/Avatar.tsx` and uncomment the TODO section at the bottom. Replace the placeholder with:

   ```typescript
   import { beyondPresence } from '@beyondpresence/sdk'

   useEffect(() => {
     if (!isConnected || !videoRef.current) return

     const initializeAvatar = async () => {
       try {
         // Get remote audio track from LiveKit room
         const audioTrack = room?.localParticipant?.audioTrackPublications?.[0]?.track?.mediaStreamTrack

         // Initialize Beyond Presence with avatar configuration
         const avatar = await beyondPresence.initialize({
           videoElement: videoRef.current!,
           audioTrack: audioTrack,
           avatarId: 'your-avatar-id',
           apiKey: process.env.NEXT_PUBLIC_BEYOND_PRESENCE_KEY,
         })

         avatar.on('ready', () => setIsLoading(false))
         avatar.on('error', (error) => console.error('Avatar error:', error))
       } catch (error) {
         console.error('Failed to initialize avatar:', error)
       }
     }

     initializeAvatar()
   }, [isConnected])
   ```

### Connecting Different Backend Endpoints

The frontend makes API calls to the backend through these routes:

**1. Get Token** (`lib/livekit.ts`)
```typescript
async function getAccessToken(username: string, identity: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/token`, {
    method: 'GET',
    params: { room: 'default-room', identity },
  })
  return response.json()
}
```

To use a different token endpoint, modify `lib/livekit.ts`:
```typescript
// Change this URL to your endpoint
const tokenUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/token`
```

**2. Get Summary** (`lib/livekit.ts`)
```typescript
async function getCallSummary(transcript: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  })
  return response.json()
}
```

---

## Testing

### Testing the Full Pipeline

1. **Start the backend** (in another terminal)
   ```bash
   cd nova-backend
   python main.py
   ```

2. **Start the frontend**
   ```bash
   npm run dev
   ```

3. **Open the app**
   ```
   http://localhost:3000
   ```

4. **Test a conversation**
   - Click "Start Nova Now" or "Try Nova Now" on the homepage
   - Scroll to the call interface
   - Click "Start Call"
   - Speak a command like: "I'd like to book an appointment with Dr. Smith on Friday at 2 PM"
   - Watch the "Tool Calls" panel update in real-time
   - Observe the transcript updating
   - Click "End Call" when done
   - Review the call summary

### Example Conversation Flow

```
Frontend: "Start Call" button clicked
  ↓
Frontend: GET /api/token?room=default&identity=user-123
  ↓
Backend: Returns LiveKit access token
  ↓
Frontend: Connects to LiveKit WebSocket
  ↓
Backend: AI agent starts listening
  ↓
User (via microphone): "I need to book an appointment"
  ↓
Backend: Processes request, extracts intent
  ↓
Backend: Publishes metadata via LiveKit
  ↓
Frontend: Listens on localParticipant.on('metadataChanged')
  ↓
Frontend: Tool Calls panel shows "BOOK_APPOINTMENT" with extracted data
  ↓
(Conversation continues...)
  ↓
Frontend: "End Call" button clicked
  ↓
Frontend: POST /api/summary with full transcript
  ↓
Backend: Generates summary
  ↓
Frontend: Shows call summary modal with appointments
```

---

## Project Structure

```
nova-frontend/
├── app/
│   ├── layout.tsx              # Root layout with dark mode
│   ├── page.tsx                # Main page (all sections)
│   ├── globals.css             # Tailwind CSS configuration
│   └── api/
│       ├── token/route.ts      # LiveKit token proxy
│       └── summary/route.ts    # Summary proxy
│
├── components/
│   ├── Header.tsx              # Navigation bar
│   ├── HeroSection.tsx         # Hero with features
│   ├── Avatar.tsx              # Tavus/Beyond Presence container
│   ├── CallControls.tsx        # Call interface controls
│   ├── AgentStatePanel.tsx     # Real-time monitoring
│   ├── SummaryCard.tsx         # Summary modal
│   ├── PortfolioSection.tsx    # Creator profile
│   ├── Footer.tsx              # Footer
│   └── ui/
│       └── button.tsx          # Base component
│
├── lib/
│   ├── livekit.ts              # LiveKit utilities
│   └── utils.ts                # Helper functions
│
├── public/
│   ├── icon.svg
│   ├── icon-light-32x32.png
│   └── icon-dark-32x32.png
│
├── .env.example                # Environment template
├── .env.local                  # Environment variables (gitignored)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.mjs             # Next.js config
└── README.md                   # This file
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Nova healthcare AI frontend"
   git push origin main
   ```

2. **Import on Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Set Environment Variables**
   - In Vercel project settings, add:
     - `NEXT_PUBLIC_LIVEKIT_URL=your-livekit-url`
     - `NEXT_PUBLIC_BACKEND_URL=your-backend-url`

4. **Deploy**
   - Click "Deploy"
   - Your app is live!

### Deploy to AWS

```bash
# 1. Build for production
npm run build

# 2. Deploy with AWS Amplify
amplify init
amplify publish
```

### Deploy to Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./.next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t nova-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_LIVEKIT_URL=... \
  -e NEXT_PUBLIC_BACKEND_URL=... \
  nova-frontend
```

---

## Configuration

### LiveKit Configuration

For production, set up a LiveKit Cloud project:

1. Go to [LiveKit Cloud](https://cloud.livekit.io)
2. Create a project
3. Get your URL: `wss://your-project.livekit.cloud`
4. Set `NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud`

### Supabase Database (Backend)

The backend uses Supabase. Set up:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  doctor_id VARCHAR NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Baseline slots table
CREATE TABLE baseline_slots (
  id UUID PRIMARY KEY,
  doctor_id VARCHAR NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available BOOLEAN DEFAULT true
);
```

---

## Troubleshooting

### "NEXT_PUBLIC_LIVEKIT_URL not set"
- Ensure `.env.local` exists in the project root
- Check that you've set `NEXT_PUBLIC_LIVEKIT_URL`
- Restart `npm run dev`

### WebSocket connection fails
- Verify LiveKit server is running
- Check CORS settings on LiveKit server
- Confirm URL in `.env.local` is accessible from your browser

### Avatar video not showing
- Ensure the backend is publishing video frames to the LiveKit room
- Check that the Tavus/Beyond Presence SDK is initialized correctly
- Verify API key in environment variables

### Tool calls not appearing in real-time
- Check that metadata is being published via `room.localParticipant.publishMetadata()`
- Verify `localParticipant.on('metadataChanged', ...)` listener is attached
- Check browser console for errors

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Support

For questions or issues:

- **Report Issues**: [GitHub Issues](https://github.com/joelsiby/nova-healthcare-ai/issues)
- **Email**: hello@joelsiby.com
- **LinkedIn**: [Joel Siby](https://linkedin.com/in/joelsiby)
- **GitHub**: [@joelsiby](https://github.com/joelsiby)

---

## Credits

Built by **Joel Siby** using:
- [Next.js](https://nextjs.org) - React framework
- [LiveKit](https://livekit.io) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TypeScript](https://www.typescriptlang.org) - Type safety

---

**Nova Healthcare AI** - Revolutionizing healthcare appointment management with AI.
