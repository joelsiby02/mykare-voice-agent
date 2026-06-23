from dotenv import load_dotenv

from livekit import agents
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    cli,
)

from livekit.plugins import (
    openai,
    deepgram,
    cartesia,
)

load_dotenv()

server = AgentServer()


class HelloAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""
            You are Maya.

            Keep responses short.

            When a user greets you,
            greet them back naturally.

            Ask one question at a time.

            Be friendly.
            """
        )


@server.rtc_session(agent_name="hello-test")
async def entrypoint(ctx: JobContext):

    print("=== JOB RECEIVED ===")

    await ctx.connect()

    print("=== CONNECTED TO ROOM ===")

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

    print("=== STARTING SESSION ===")

    await session.start(
        room=ctx.room,
        agent=HelloAgent(),
    )

    print("=== SESSION STARTED ===")

    await session.generate_reply(
        instructions="Say: Hello, I am Maya. Can you hear me?"
    )

    print("=== GREETING SENT ===")


if __name__ == "__main__":
    cli.run_app(server)