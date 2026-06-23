import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Strict 1.6.2 LiveKit Agents SDK Connection Core Imports
from livekit.agents import (
    AgentServer, 
    AgentSession, 
    Agent, 
    JobContext, 
    cli
)
from livekit.plugins import openai, deepgram, cartesia

# Import your decorated tools class
from db import HealthcareTools

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

# Initialize the new 1.6.2 AgentServer process instance
server = AgentServer()

@server.rtc_session()
async def mykare_voice_entrypoint(ctx: JobContext):
    print(f"--- [KareOS] New Worker Spawned for Room: {ctx.room.name} ---")
    
    # Establish connection to LiveKit Cloud WebRTC mesh
    await ctx.connect()
    print("--- [KareOS] WebRTC Mesh Connected Successfully ---")

    # Instantiate the tools layer passing our room context for telemetry streaming
    tools_layer = HealthcareTools(ctx_room=ctx.room)

    system_instructions = (
        "You are Maya, the warm and concise AI clinical receptionist for Mykare Health. "
        "Your duty is to coordinate patient registrations and schedule appointment records. "
        "Always follow this exact workflow checklist:\n"
        "1. Greet the patient warmly and ask for their mobile phone number to check their profile account.\n"
        "2. Invoke 'identify_user'. If missing, ask for their full name and call 'register_user'.\n"
        "3. Manage slots, view schedules, modify dates, or cancel bookings using your functions.\n"
        "4. When the user indicates they are finished, invoke 'end_conversation'.\n\n"
        "Constraints:\n"
        "- Never guess an appointment ID. Always execute 'retrieve_appointments' first to look up active records.\n"
        "- Keep voice responses under two short sentences to ensure sub-second latency."
    )

    # Compile our tool instance methods into an array for the LLM
    active_tools = [
        tools_layer.identify_user,
        tools_layer.register_user,
        tools_layer.fetch_slots,
        tools_layer.book_appointment,
        tools_layer.retrieve_appointments,
        tools_layer.cancel_appointment,
        tools_layer.modify_appointment,
        tools_layer.end_conversation,
    ]

    # Initialize the modern 1.6.2 Agent configuration core
    healthcare_agent = Agent(
        instructions=system_instructions,
        tools=active_tools
    )

    # Connect our standard STT, LLM, and TTS pipelines to the Session instance
    session = AgentSession(
        stt=deepgram.STT(model="nova-2-general"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=cartesia.TTS(voice_id="e583f69e-acfb-4aa5-85a0-d123ee313cb9") # Clear healthcare voice
    )

    print("--- [KareOS] Pipeline Assembled. Starting Audio Stream Session... ---")
    
    # Start our configured agent within this WebRTC workspace session
    await session.start(room=ctx.room, agent=healthcare_agent)
    print("--- [KareOS] Maya Voice Processing Session is Live ---")

    # Instruct Maya to generate her default welcoming speech phrase automatically
    await session.generate_reply(
        instructions="Introduce yourself as Maya from Mykare Health and ask for their phone number to pull up their profile."
    )

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
