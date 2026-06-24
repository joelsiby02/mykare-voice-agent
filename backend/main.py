import os
import asyncio
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from livekit import api
import re

# LiveKit Agents SDK
from livekit.agents import (
    AgentServer,
    AgentSession,
    Agent,
    JobContext,
    cli
)
from livekit.plugins import openai, deepgram, cartesia

# Import your tools
from tools import (
    identify_user,
    register_user,
    fetch_slots,
    book_appointment,
    retrieve_appointments,
    cancel_appointment,
    modify_appointment,
    end_conversation
)

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fix LiveKit URL if it ends with '/agent'
url_env = os.getenv("LIVEKIT_URL", "")
if url_env.endswith("/agent"):
    os.environ["LIVEKIT_URL"] = url_env.replace("/agent", "")

server = AgentServer()


class MayaHealthcareAgent(Agent):
    def __init__(self):
        # Force IST date for accurate "today" references
        utc_now = datetime.now(timezone.utc)
        ist_offset = timedelta(hours=5, minutes=30)
        ist_now = utc_now + ist_offset
        current_live_datetime = ist_now.strftime("%A, %B %d, %Y")

        system_instructions = (
            f"You are Nova, the warm, polite, and natural AI clinical receptionist for Mykare Health. "
            f"Your duty is to assist patients with scheduling and managing appointment records.\n\n"
            f"CRITICAL REAL-TIME baseline: Today's absolute date is strictly {current_live_datetime}.\n"
            f"Compute relative days (like 'tomorrow' or 'day after tomorrow') strictly based on this present baseline year, month, and day.\n\n"
            "CONVERSATIONAL PACING RULES:\n"
            "- Conversation Flow: Open with a welcoming clinical greeting and ask how you can help them today. "
            "DO NOT ask for their mobile phone number or record immediately. Let them state their intent first (e.g., 'I want to book an appointment').\n"
            "- Account Lookup: Once they ask to book, view, or change an appointment, seamlessly pivot and ask for their mobile number to check their account record.\n"
            "- Business Hour Validation: If a user selects a time outside our opening hours, or if a database tool logs an output error or slot 'REJECTION', "
            "read the tool response directly, explain the specific issue to the patient naturally, and pivot to assist them with an alternative available choice.\n\n"
            "OPERATIONAL WORKFLOW CHECKLIST:\n"
            "1. Greet the patient and ask how you can help them.\n"
            "2. When a tool action is implied, collect their phone number and run 'identify_user'. If missing from the database, call 'register_user'.\n"
            "3. Process slot lookups or booking mutations through your functional layer.\n"
            "4. Invoke 'end_conversation' only when they explicitly signal they are completely finished.\n\n"
            "--- CANCELLATION & MODIFICATION WORKFLOW (CRITICAL) ---\n"
            "When a patient asks to cancel or modify an appointment:\n"
            "   a) First call 'retrieve_appointments' with their phone number to fetch all their bookings.\n"
            "   b) The tool returns a list with Record IDs, dates, times, and statuses.\n"
            "   c) If multiple appointments exist, ask the patient to specify which one (by date/time) they want to change.\n"
            "   d) Once you have the specific appointment ID, call 'cancel_appointment(appointment_id)' or 'modify_appointment(appointment_id, new_date, new_time)'.\n"
            "   e) Never guess or invent an appointment ID – always obtain it from the retrieval result.\n\n"
            "--- CONVERSATIONAL PRECISION RULES ---\n"
            "- When a patient gives a phone number or name, repeat it back with the correct spelling/numberization and ask for confirmation.\n"
            "- If a number is unclear, politely say: 'I'm sorry, could you please repeat that?'\n"
            "- Be gentle, empathetic, and patient - if a patient seems confused, offer to repeat information.\n"
            "- Always confirm: 'Let me confirm, your phone number is ...' before booking.\n"
            "- If the patient spells out their name, reply with the full name spelled correctly.\n\n"
            "CONSTRAINTS:\n"
            "- Keep voice responses under two short sentences to ensure sub-second latency."
        )

        super().__init__(
            instructions=system_instructions,
            tools=[
                identify_user,
                register_user,
                fetch_slots,
                book_appointment,
                retrieve_appointments,
                cancel_appointment,
                modify_appointment,
                end_conversation,
            ]
        )


@server.rtc_session(agent_name="maya")
async def mykare_voice_entrypoint(ctx: JobContext):
    print("=== [KareOS] JOB RECEIVED ===")

    await ctx.connect()
    print("=== [KareOS] CONNECTED TO ROOM ===")

    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="en",
        ),
        llm=openai.LLM(
            model="gpt-4o-mini",
        ),
        # tts=cartesia.TTS(

        # ),
        tts=openai.TTS(
        model="tts-1",
        voice="alloy" # Options: alloy, echo, fable, onyx, nova, shimmer
    ),
    )

    print("=== [KareOS] STARTING SESSION ===")

    await session.start(
        room=ctx.room,
        agent=MayaHealthcareAgent(),
    )

    print("=== [KareOS] SESSION STARTED ===")

    # ✅ GREETING UPDATED TO "Nova"
    await session.generate_reply(
        instructions="Say: Hello, welcome to Mykare Health. I am Nova, your automated care coordinator. How can I help you today?"
    )
    print("=== [KareOS] GREETING SENT ===")


# ========== ROOT ENDPOINT ==========
@app.get("/")
async def root():
    return {"message": "Mykare Health AI API is running. Use /api/token to get a LiveKit token."}


# ========== TOKEN ENDPOINT ==========
@app.get("/api/token")
async def fetch_access_token(room: str, identity: str):
    print("🚀 NEW TOKEN CODE IS RUNNING!")
    token = api.AccessToken(
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET")
    )
    token.with_identity(identity)
    token.with_name(identity)
    
    # 1. Setup standard grants
    token.with_grants(
        api.VideoGrants(
            room_join=True,
            room=room,
        )
    )
    
    # 2. Explicitly create the configuration objects
    agent_dispatch = api.RoomAgentDispatch(agent_name="maya")
    room_config = api.RoomConfiguration(agents=[agent_dispatch])
    token.with_room_config(room_config)
    
    # ─── COMPATIBILITY PATCH FOR SERIALIZATION ───
    try:
        if hasattr(token.claims, "video") and token.claims.video is not None:
            token.claims.video.__dict__["room_config"] = room_config
            token.claims.video.__dict__["roomConfig"] = {
                "agents": [{"agentName": "maya", "agent_name": "maya"}]
            }
    except Exception as e:
        print(f"Token patch warning skipped: {e}")
    # ─────────────────────────────────────────────
    
    return {"token": token.to_jwt()}


# ========== SUMMARY ENDPOINT (ENHANCED) ==========
@app.post("/api/summary")
async def generate_summary(request: Request):
    data = await request.json()
    transcript = data.get("transcript", "")

    # --- Enhanced extraction with better regex ---
    name_match = re.search(r"(?:my name is|I am|called|name['']s?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)", transcript, re.I)
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,10}", transcript)
    date_match = re.search(r"(\d{4}-\d{2}-\d{2})", transcript)
    time_match = re.search(r"(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)", transcript)
    
    # Try to extract date in natural language
    if not date_match:
        date_match = re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})[,']?\s*(\d{4})?", transcript, re.I)
        if date_match:
            date_match = date_match.group(0)

    intent = "unknown"
    if "book" in transcript.lower():
        intent = "book"
    elif "cancel" in transcript.lower() or "cancel appointment" in transcript.lower():
        intent = "cancel"
    elif "modify" in transcript.lower() or "reschedule" in transcript.lower():
        intent = "modify"
    elif "view" in transcript.lower() or "check" in transcript.lower():
        intent = "retrieve"

    summary_lines = []
    if name_match:
        summary_lines.append(f"👤 Patient: {name_match.group(1)}")
    if phone_match:
        summary_lines.append(f"📞 Phone: {phone_match.group(0)}")
    if intent != "unknown":
        summary_lines.append(f"🎯 Intent: {intent.upper()}")
    if date_match:
        summary_lines.append(f"📅 Date: {date_match}")
    if time_match:
        summary_lines.append(f"🕐 Time: {time_match.group(0)}")
    
    if not summary_lines:
        summary_lines.append("ℹ️ No key details extracted. Transcript preview below:")

    summary_text = "\n".join(summary_lines)
    summary_text += f"\n\n📝 Transcript preview:\n{transcript[:500]}..."

    return {
        "summary": summary_text,
        "appointments": [],
        "timestamp": datetime.now().isoformat()
    }


# ========== MAIN ENTRY POINT ==========
if __name__ == "__main__":
    print("=== Starting LiveKit Agent Server (main) ===")
    os.environ["LIVEKIT_PORT"] = "8082"
    cli.run_app(server)