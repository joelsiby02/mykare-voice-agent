# Quick Start Guide

Get the Healthcare AI Assistant frontend running in 5 minutes.

## 1. Prerequisites

- **Node.js 18+** → Check with `node --version`
- **pnpm** (or npm/yarn) → Check with `pnpm --version`

## 2. Installation (1 minute)

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

## 3. Configuration (2 minutes)

Edit `.env.local` with your settings:

```env
# Required - LiveKit server URL (must be accessible from browser)
NEXT_PUBLIC_LIVEKIT_URL=http://localhost:7880

# Optional - Backend service URL (defaults to localhost:8082)
BACKEND_URL=http://localhost:8082
```

**If using Vercel project:**
- Go to Settings → Environment Variables
- Add `NEXT_PUBLIC_LIVEKIT_URL` and `BACKEND_URL`

## 4. Start Development Server (1 minute)

```bash
pnpm dev
```

Open browser to: **http://localhost:3000**

## 5. Test the UI (1 minute)

1. Click "Start Call" button
2. You should see status change to "Connecting"
3. If it fails, check console for errors
4. See "Troubleshooting" section below

---

## Common Scenarios

### Scenario 1: Testing Without Backend

Mock the API endpoints temporarily:

**Edit `app/api/token/route.ts`:**
```typescript
// Temporarily return mock token for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    token: 'mock_token_for_testing'
  })
}
```

**Edit `app/api/summary/route.ts`:**
```typescript
// Temporarily return mock summary for testing
export async function POST(request: NextRequest) {
  return NextResponse.json({
    summary: 'Call ended. This is a mock summary for testing.',
    appointments: [{
      date: '2024-06-24',
      time: '4:00 PM',
      type: 'General Checkup'
    }],
    timestamp: new Date().toISOString()
  })
}
```

Then restart: `pnpm dev`

### Scenario 2: Using Production Backend

Update `.env.local`:
```env
NEXT_PUBLIC_LIVEKIT_URL=https://your-livekit-server.com
BACKEND_URL=https://your-backend.com
```

### Scenario 3: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t healthcare-assistant .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_LIVEKIT_URL=http://livekit:7880 \
  -e BACKEND_URL=http://backend:8082 \
  healthcare-assistant
```

---

## Project Structure

```
/app                        # Next.js app directory
  ├── page.tsx             # Main component (the app)
  ├── layout.tsx           # Layout & metadata
  └── api/                 # API routes
      ├── token/           # LiveKit token proxy
      └── summary/         # Summary generation proxy

/components                 # React components
  ├── CallControls.tsx     # Start/stop/mute
  ├── AgentStatePanel.tsx  # Tool calls & transcript
  └── SummaryCard.tsx      # Summary modal

/lib                       # Utilities
  ├── livekit.ts          # LiveKit helpers
  └── utils.ts            # General utilities
```

---

## Available Commands

```bash
# Development
pnpm dev              # Start dev server (hot reload)
pnpm build            # Build for production
pnpm start            # Run production build
pnpm lint             # Run ESLint

# Utilities
pnpm type-check       # TypeScript check (if available)
```

---

## Troubleshooting

### "NEXT_PUBLIC_LIVEKIT_URL is not set"
**Fix:** Make sure `.env.local` has `NEXT_PUBLIC_LIVEKIT_URL` set

### "Cannot GET /"
**Fix:** Dev server might not have started. Check terminal for errors.

### "Failed to get access token"
**Possible causes:**
1. Backend not running
2. `BACKEND_URL` incorrect
3. `/api/token` endpoint not responding

**Debug:**
```bash
# Test token endpoint
curl http://localhost:3000/api/token?room=test&identity=user1
```

### "Connection failed" on Start Call
**Possible causes:**
1. LiveKit server not running
2. `NEXT_PUBLIC_LIVEKIT_URL` incorrect
3. Network connectivity issue

**Debug:**
- Check browser console (F12 → Console tab)
- Verify LiveKit server is accessible
- Test URL: `curl $NEXT_PUBLIC_LIVEKIT_URL`

### UI not updating after clicking button
**Fix:** 
1. Check browser DevTools console for errors (F12)
2. Make sure JavaScript is enabled
3. Try hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R`)

### Slow page load
**Optimize:**
1. Check network tab in DevTools
2. Verify backend is responding quickly
3. Check for console errors blocking scripts

---

## Next Steps

### 1. **Read Documentation**
- `README.md` - Full feature documentation
- `INTEGRATION_GUIDE.md` - Backend integration requirements
- `PROJECT_SUMMARY.md` - Project overview

### 2. **Integrate Backend**
- Implement `/token` endpoint
- Implement `/summary` endpoint
- Send tool calls and transcript via LiveKit data channel

### 3. **Customize**
- Modify colors in Tailwind config
- Add your branding
- Adjust components for your needs

### 4. **Deploy**
- See `DEPLOYMENT_CHECKLIST.md`
- Use Vercel (recommended) or self-host
- Set production environment variables

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_LIVEKIT_URL` | ✅ Yes | N/A | LiveKit server URL (public) |
| `BACKEND_URL` | ❌ No | `http://localhost:8082` | Backend service URL |

---

## Resources

- **LiveKit Docs**: https://docs.livekit.io/
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com

---

## Support

Having issues? Check:

1. **Browser Console** (F12 → Console) - Error messages
2. **Network Tab** (F12 → Network) - API requests
3. **README.md** - Feature details
4. **INTEGRATION_GUIDE.md** - Backend requirements
5. **DEPLOYMENT_CHECKLIST.md** - Production setup

---

**Ready to go! 🚀**

Run `pnpm dev` and open http://localhost:3000
