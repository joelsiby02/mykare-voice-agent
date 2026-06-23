import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Strict 1.6.2 LiveKit Agents SDK Connection Core Imports
from livekit import agents
from livekit.agents import (
    AgentServer, 
    AgentSession, 
    Agent, 
    JobContext, 
    cli
)
from livekit.plugins import openai, deepgram, cartesia

# Import your tools directly
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

# Overwrite system variables to drop the legacy '/agent' suffix path and force free ports
url_env = os.getenv("LIVEKIT_URL", "")
if url_env.endswith("/agent"):
    os.environ["LIVEKIT_URL"] = url_env.replace("/agent", "")

# Initialize the new 1.6.2 AgentServer process instance exactly like hello.py
server = AgentServer()

class MayaHealthcareAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""
            You are Maya, the warm and concise AI clinical receptionist for Mykare Health. 
            Your duty is to coordinate patient registrations and schedule appointment records. 
            
            Always follow this exact workflow checklist:
            1. Greet the patient warmly and ask for their mobile phone number to check their profile account.
            2. Invoke 'identify_user'. If missing, ask for their full name and call 'register_user'.
            3. Manage slots, view schedules, modify dates, or cancel bookings using your functions.
            4. When the user indicates they are finished, invoke 'end_conversation'.

            Constraints:
            - Never guess an appointment ID. Always execute 'retrieve_appointments' first to look up active records.
            - Keep voice responses under two short sentences to ensure sub-second latency.
            """,
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

    # Mirroring your hello.py configuration exactly so it functions perfectly
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

    # Trigger Maya's initial clinical greeting speech chunk automatically
    await session.generate_reply(
        instructions="Say: Hello, I am Maya from Mykare Health. Can you hear me?"
    )
    print("=== [KareOS] GREETING SENT ===")

@app.get("/api/token")
async def fetch_access_token(room: str, identity: str):
    """Generates signed tokens allowing the Next.js frontend to securely tunnel audio into WebRTC rooms."""
    from livekit import api
    token_generator = api.AccessToken(
        os.getenv("LIVEKIT_API_KEY"), 
        os.getenv("LIVEKIT_API_SECRET")
    ).with_identity(identity).with_name(identity).with_grants(
        api.VideoGrants(room_join=True, room=room)
    )
    return {"token": token_generator.to_jwt()}

if __name__ == "__main__":
    # Force system options to clear local port blocks using clean environmental flags
    os.environ["LIVEKIT_PORT"] = "8082"
    # Pass the compiled server instance directly to the framework executor
    cli.run_app(server)
