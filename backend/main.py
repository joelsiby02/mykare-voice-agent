import os
import asyncio
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# LiveKit Agents SDK
from livekit.agents import (
    AgentServer,
    AgentSession,
    Agent,
    JobContext,
    cli
)
from livekit.plugins import openai, deepgram, cartesia

# Import your tools (ensure these are plain async functions or callable tools)
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
        # ---- NATURAL FLOW: dynamic date and conversational pacing ----
        # Force IST date for accurate "today" references
        utc_now = datetime.now(timezone.utc)
        ist_offset = timedelta(hours=5, minutes=30)
        ist_now = utc_now + ist_offset
        current_live_datetime = ist_now.strftime("%A, %B %d, %Y")

        system_instructions = (
            f"You are Maya, the warm, polite, and natural AI clinical receptionist for Mykare Health. "
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
        tts=cartesia.TTS(),
    )

    print("=== [KareOS] STARTING SESSION ===")

    await session.start(
        room=ctx.room,
        agent=MayaHealthcareAgent(),
    )

    print("=== [KareOS] SESSION STARTED ===")

    # Updated greeting: warm, open, and not immediately asking for phone number
    await session.generate_reply(
        instructions="Say: Hello, welcome to Mykare Health. I am Maya, your automated care coordinator. How can I help you today?"
    )
    print("=== [KareOS] GREETING SENT ===")


@app.get("/api/token")
async def fetch_access_token(room: str, identity: str):
    from livekit import api
    token_generator = api.AccessToken(
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET")
    ).with_identity(identity).with_name(identity).with_grants(
        api.VideoGrants(room_join=True, room=room)
    )
    return {"token": token_generator.to_jwt()}


if __name__ == "__main__":
    # Add a debug print to confirm we reach this block
    print("=== Starting LiveKit Agent Server (main) ===")
    os.environ["LIVEKIT_PORT"] = "8082"
    # cli.run_app will parse sys.argv; if you pass "start", it will start the server
    cli.run_app(server)