# 🏥 Nova – AI Healthcare Receptionist

> Voice AI Agent for Mykare Health · Built for the Voice AI Engineer Technical Assessment

![Status](https://img.shields.io/badge/status-working-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![LiveKit](https://img.shields.io/badge/LiveKit-Agents-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Python](https://img.shields.io/badge/Python-3.13-blue)

---

# 📋 Overview

Nova is a production-oriented AI voice receptionist built for healthcare appointment management. The system enables patients to interact naturally through voice while handling appointment booking, cancellation, modification, and retrieval using real-time speech processing, LLM reasoning, tool calling, and database operations.

## Features

| Feature                        | Status    |
| ------------------------------ | --------- |
| Voice Conversation (STT + TTS) | ✅ Working |
| Intent Understanding (LLM)     | ✅ Working |
| Tool Calling                   | ✅ Working |
| Supabase Integration           | ✅ Working |
| Appointment Booking            | ✅ Working |
| Appointment Cancellation       | ✅ Working |
| Appointment Modification       | ✅ Working |
| Appointment Retrieval          | ✅ Working |
| Call Summary Generation        | ✅ Working |
| Real-Time Tool Call Updates    | ✅ Working |
| Responsive UI                  | ✅ Working |
| Animated Voice Avatar          | ✅ Working |

---

# 📌 Assignment Context

This project was built as part of the **Mykare Health Voice AI Engineer Technical Assessment**.

The objective was to design and implement an AI-powered healthcare receptionist capable of handling appointment-related workflows through natural voice conversations.

Given the assessment timeline (24–48 hours), the primary focus was on:

* Building a reliable end-to-end voice experience
* Implementing robust tool-calling workflows
* Handling real-world appointment management scenarios
* Ensuring database persistence and validation
* Demonstrating production-oriented architecture decisions
* Shipping a complete deployable solution within the allotted time

Where trade-offs were necessary, priority was given to functionality, reliability, maintainability, and scalability.

This repository represents my submission for the Mykare Voice AI Engineer hiring process.

---

# ⚠️ Known Limitations

| Limitation              | Reason                           | Future Plan                       |
| ----------------------- | -------------------------------- | --------------------------------- |
| Full Lip-Sync Avatar    | Prioritized core voice workflows | Integrate Tavus / Beyond Presence |
| Live Transcript Display | Tool call visibility prioritized | Add transcript panel              |
| Browser Compatibility   | Browser audio policies vary      | Improve fallback handling         |

> The current avatar uses SVG-based animation to simulate speaking behavior. Full avatar SDK integration was intentionally deprioritized to ensure the core voice workflow was completed within the assessment timeline.

---

# 🧠 Architecture & Design Decisions

Instead of building a monolithic application, Nova separates responsibilities across independent services.

```text
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │─────▶│     LiveKit     │─────▶│    AI Agent     │
│    Next.js      │◀─────│    Real-Time    │◀─────│     Python      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ UI Updates      │      │ Audio Stream    │      │ Tool Calls      │
│ Tool Events     │      │ WebRTC Layer    │      │ DB Operations   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Why This Architecture

### Scalability

Each service can scale independently as patient volume grows.

### Reliability

Failure in one component does not impact the entire system.

### Maintainability

Frontend, voice orchestration, and business logic remain decoupled.

### Production Alignment

This architecture mirrors modern enterprise voice AI systems.

---

# ✅ Technology Choices

| Component        | Selected                  | Alternative             | Why                                         |
| ---------------- | ------------------------- | ----------------------- | ------------------------------------------- |
| Agent Framework  | LiveKit Agents            | Custom WebSocket Agent  | Faster development and production readiness |
| STT              | Deepgram Nova-3           | Whisper                 | Lower latency and better streaming          |
| LLM              | GPT-4o-mini               | Open-source models      | Cost-effective and reliable                 |
| TTS              | Cartesia                  | ElevenLabs / OpenAI TTS | High-quality low-latency voice generation   |
| Real-Time Events | LiveKit Metadata          | Data Channels           | Native support                              |
| Tool Calling     | Function Tools            | Manual Intent Parsing   | Cleaner architecture                        |
| Database         | Supabase PostgreSQL       | SQLite                  | Cloud-native and scalable                   |
| Deployment       | Render + Railway + Vercel | Single VM               | Better resource isolation                   |

---

# 💡 Why This Matters for Mykare

* Scalable architecture for future clinic growth
* Low operational cost
* Low-latency voice interactions
* Maintainable codebase
* Production-focused design rather than a prototype

---

# 🛠️ Tech Stack

## Backend

* Python 3.13
* FastAPI
* LiveKit Agents SDK
* Deepgram Nova-3
* GPT-4o-mini
* Cartesia
* Supabase PostgreSQL
* Railway
* Render

## Frontend

* Next.js 16
* TypeScript
* Tailwind CSS v4
* LiveKit Client SDK
* Vercel

---

# 🔧 Edge Case Handling

| Edge Case               | Validation                | Handling                   |
| ----------------------- | ------------------------- | -------------------------- |
| Invalid Phone Number    | Format validation         | Requests corrected number  |
| Missing Required Fields | Required field validation | Prompts user again         |
| Past Date Booking       | Date comparison           | Rejects booking            |
| Invalid Slot Selection  | Slot validation           | Suggests valid slots       |
| Duplicate Booking       | Database constraints      | Prevents duplicate booking |
| Empty Transcript        | Summary validation        | Returns fallback response  |

---

# 📊 Estimated Cost Per Call

| Service      | Estimated Cost |
| ------------ | -------------- |
| Deepgram STT | ~$0.0005       |
| GPT-4o-mini  | ~$0.00015      |
| Cartesia TTS | ~$0.0003       |
| LiveKit      | Free Tier      |
| Supabase     | Free Tier      |

### Total Estimated Cost

**~$0.001 per call**

---

# 📁 Project Structure

```text
backend/
├── main.py
├── tools.py
├── db.py
├── agent.py
└── requirements.txt

frontend/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
├── components/
│   ├── CallControls.tsx
│   ├── AgentStatePanel.tsx
│   ├── Avatar.tsx
│   ├── SummaryCard.tsx
│   └── PortfolioSection.tsx
└── lib/
    └── livekit.ts
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend directory.

```env
# Cartesia
CARTESIA_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# LiveKit
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

## Environment Variable Details

| Variable           | Purpose              |
| ------------------ | -------------------- |
| CARTESIA_API_KEY   | Cartesia API Key     |
| SUPABASE_URL       | Supabase Project URL |
| SUPABASE_KEY       | Supabase Service Key |
| LIVEKIT_URL        | LiveKit Server URL   |
| LIVEKIT_API_KEY    | LiveKit API Key      |
| LIVEKIT_API_SECRET | LiveKit API Secret   |

---

# ⚙️ Local Development Setup

## Prerequisites

* Python 3.13+
* Node.js 20+
* LiveKit Account
* Supabase Project
* Cartesia Account

---

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate
# Windows:
# venv\Scripts\activate

pip install -r requirements.txt
```

Start backend:

```bash
python main.py
```

---

## Agent Worker

```bash
python agent.py dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🚀 Deployment

| Service | Purpose              |
| ------- | -------------------- |
| Vercel  | Frontend Hosting     |
| Render  | FastAPI Backend      |
| Railway | LiveKit Agent Worker |

---

# 🧪 How to Test

1. Open the frontend application.
2. Click **Start Call**.
3. Try the following prompts:

```text
I want to book an appointment.

My phone number is 9876543210.

Book it for tomorrow at 10 AM.

I want to cancel my appointment.

Show my upcoming appointments.
```

4. Observe tool calls in real-time.
5. End the call.
6. Review the generated summary.

---

# 💡 Lessons Learned

### LiveKit Agents

Powerful framework with a learning curve around session management and metadata publishing.

### Metadata Publishing

Updates must be published through the local participant rather than the session object.

### Browser Audio Policies

Chrome currently provides the most reliable WebRTC experience.

### Deployment Strategy

Separating backend APIs and agent workers improves reliability and resource management.

### Validation Matters

Robust validation significantly improves user experience.

---

# 🔮 Future Roadmap

* [ ] Full lip-sync avatar
* [ ] Live transcript display
* [ ] User speech transcription
* [ ] Multilingual support
* [ ] Call recording
* [ ] Analytics dashboard
* [ ] SMS reminders
* [ ] Email reminders
* [ ] Doctor availability management
* [ ] Multi-clinic support

---

# 📄 License

MIT License

Free for personal and commercial use.

---

## Built for Healthcare Innovation

**Joel Siby**

Portfolio: https://joelsiby.vercel.app

LinkedIn: https://linkedin.com/in/joelsiby

GitHub: https://github.com/joolsiby02
