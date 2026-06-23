# Voice-Based AI Healthcare Agent - Frontend Application

## Overview

A production-ready Next.js 14 frontend for a voice-based AI healthcare assistant that facilitates appointment booking and health information retrieval through natural conversation.

## What's Built

### ✅ Core Features
- **Live Call Interface**: Start/stop calls with real-time connection status
- **Mute Controls**: Toggle microphone during active calls
- **Real-Time Agent Monitoring**: View tool calls as the agent executes them
- **Live Transcript**: See conversation unfold with speaker identification
- **Call Summary**: Generate and download conversation summaries with appointment data
- **Avatar Ready**: Prepared for integration with Tavus/Beyond Presence avatar systems

### ✅ Technical Stack
- **Framework**: Next.js 16 with TypeScript
- **UI Framework**: React 19 with Tailwind CSS v4
- **Real-Time Communication**: LiveKit client SDK
- **Icons**: Lucide React
- **Styling**: Professional healthcare theme (blue & white)
- **Architecture**: Server-side API routes + client components

### ✅ Project Structure
```
/app
  ├── page.tsx                 # Main application component
  ├── layout.tsx               # Root layout with metadata
  ├── globals.css              # Tailwind CSS configuration
  └── api/
      ├── token/route.ts       # LiveKit token generation proxy
      └── summary/route.ts     # Call summary endpoint proxy

/components
  ├── CallControls.tsx         # Call start/stop/mute buttons
  ├── AgentStatePanel.tsx      # Tool calls + transcript display
  └── SummaryCard.tsx          # Call summary modal

/lib
  ├── livekit.ts               # LiveKit integration utilities
  └── utils.ts                 # Helper functions

/public                        # Static assets

README.md                       # User documentation
INTEGRATION_GUIDE.md            # Backend integration requirements
PROJECT_SUMMARY.md             # This file
.env.example                   # Environment variable template
```

## Components Breakdown

### 1. CallControls Component
Controls the call lifecycle and audio state.

**Features:**
- Start/Stop buttons
- Mute/Unmute toggle
- Real-time status display with color indicators
- Connection feedback

**Props:**
```typescript
interface CallControlsProps {
  onStartCall: () => Promise<void>
  onEndCall: () => Promise<void>
  onToggleMute: () => void
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  isMuted: boolean
  isLoading?: boolean
}
```

### 2. AgentStatePanel Component
Displays real-time agent activity and conversation.

**Features:**
- Scrollable tool calls list with extracted parameters
- Live transcript with timestamps
- Auto-scroll to latest messages
- Visual distinction between tool actions and messages

**Props:**
```typescript
interface AgentStatePanelProps {
  toolCalls: ToolCall[]
  transcript: TranscriptEntry[]
}
```

### 3. SummaryCard Component
Modal for displaying call summaries with download functionality.

**Features:**
- Summary text display
- Appointment list with dates/times
- Download as text file
- Close button to dismiss

**Props:**
```typescript
interface SummaryCardProps {
  summary: CallSummary | null
  onClose: () => void
  isLoading?: boolean
}
```

## API Integration

### Token Endpoint
**Route:** `GET /api/token`
- Proxies requests to backend at `BACKEND_URL/token`
- Returns LiveKit JWT for room access
- Handles authentication errors gracefully

### Summary Endpoint
**Route:** `POST /api/summary`
- Sends transcript to backend at `BACKEND_URL/summary`
- Returns parsed summary with appointments
- Fallback response on errors

## LiveKit Integration

### Connection Flow
1. User clicks "Start Call"
2. Frontend fetches token via `/api/token` endpoint
3. Frontend connects to LiveKit room
4. Room event listeners activated
5. Backend agent joins room
6. Audio and data exchange begins

### Data Communication
Tool calls and transcript updates transmitted via LiveKit data channel:

```json
// Tool call event
{
  "type": "tool_call",
  "toolName": "fetch_slots",
  "data": { "date": "2024-06-24", "provider": "Dr. Smith" }
}

// Transcript event
{
  "type": "transcript",
  "speaker": "Agent",
  "text": "I found three available slots"
}
```

## Environment Configuration

```env
# Required
NEXT_PUBLIC_LIVEKIT_URL=http://localhost:7880

# Optional - defaults to localhost:8082
BACKEND_URL=http://localhost:8082
```

## Setup & Installation

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local

# Start dev server
pnpm dev

# Open browser
http://localhost:3000
```

## Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main app component, manages call state and LiveKit connection |
| `app/layout.tsx` | Root layout with metadata, fonts, and global styles |
| `app/api/token/route.ts` | Backend proxy for LiveKit token generation |
| `app/api/summary/route.ts` | Backend proxy for call summary generation |
| `lib/livekit.ts` | LiveKit utilities: connection, event setup, data sending |
| `components/CallControls.tsx` | Call control UI component |
| `components/AgentStatePanel.tsx` | Agent state and transcript display |
| `components/SummaryCard.tsx` | Summary modal component |

## Design System

### Colors
- **Primary**: Blue (#0066cc) - Buttons, actions, links
- **Success**: Green - Connected status
- **Warning**: Yellow - Connecting status
- **Error**: Red - Error status, disconnect
- **Neutral**: Slate (gray variants) - Text, borders, backgrounds

### Typography
- **Headings**: Geist Sans (bold)
- **Body**: Geist Sans (regular)
- **Code**: Geist Mono

### Spacing & Layout
- 6px base unit (Tailwind default)
- Responsive grid: 1 column (mobile) → 3 columns (desktop)
- Card-based layout with shadows and borders

## Performance Optimizations

- **Component Code-splitting**: Dynamic imports where beneficial
- **Image Optimization**: SVG icons from Lucide
- **Tailwind CSS**: Only used utilities included in build
- **Next.js Image**: Optimized static assets
- **Event Listeners**: Proper cleanup on unmount

## Accessibility

- Semantic HTML structure
- ARIA labels and roles where needed
- Keyboard navigation support
- Color contrast compliance
- Status indicators with text

## Error Handling

- Graceful connection failures
- User-friendly error messages
- Fallback responses for API failures
- Console logging for debugging
- Status indicators for connection issues

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancement Opportunities

1. **Avatar Integration**: Tavus/Beyond Presence video
2. **Call Recording**: Save conversations for review
3. **Multi-language**: Internationalization support
4. **Analytics**: Call metrics and success tracking
5. **History**: Call logs and replay functionality
6. **Accessibility**: Enhanced voice control and screen reader support
7. **Dark Mode**: Theme toggle
8. **Network Quality**: Real-time connection quality indicators

## Deployment

### Development
```bash
pnpm dev
# Runs on http://localhost:3000
```

### Production Build
```bash
pnpm build
pnpm start
# Optimized build in .next/
```

### Deployment Options
- **Vercel**: `vercel deploy` (recommended for Next.js)
- **Docker**: `docker build . && docker run ...`
- **Self-hosted**: Node.js with `npm start`

## Documentation Files

- **README.md**: User guide and feature documentation
- **INTEGRATION_GUIDE.md**: Backend integration requirements
- **PROJECT_SUMMARY.md**: This file - project overview
- **.env.example**: Environment variable template

## Security Notes

- No hardcoded credentials or secrets
- JWT tokens handled by backend
- HTTPS recommended for production
- CORS properly configured in API routes
- Input validation on form data
- No sensitive data in localStorage

## Testing

### Manual Testing Checklist
- [ ] Start call connects successfully
- [ ] Mute/unmute toggles correctly
- [ ] Tool calls appear in real-time
- [ ] Transcript updates as conversation happens
- [ ] End call triggers summary generation
- [ ] Summary modal displays correctly
- [ ] Download summary works
- [ ] Responsive layout on mobile

### With Mock Backend
See INTEGRATION_GUIDE.md for mock endpoint implementations.

## Troubleshooting

### Common Issues

**App won't start**
- Check Node.js version (18+)
- Run `pnpm install` to ensure dependencies
- Check console for TypeScript errors

**Can't connect to LiveKit**
- Verify `NEXT_PUBLIC_LIVEKIT_URL` is set
- Check backend is running
- Inspect browser console for CORS errors

**No transcript appearing**
- Ensure backend is sending transcript events
- Check LiveKit data channel in browser DevTools
- Verify JSON format matches expected structure

**API errors**
- Check `BACKEND_URL` environment variable
- Verify backend endpoints are responding
- Monitor network requests in DevTools

## Support & Resources

- **LiveKit Documentation**: https://docs.livekit.io/
- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

## License

MIT - Free for commercial and personal use

---

**Version**: 1.0.0  
**Created**: June 2024  
**Framework**: Next.js 16 + React 19  
**Build Status**: ✅ Production Ready
