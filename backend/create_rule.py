import os
import asyncio
from livekit import api
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("LIVEKIT_API_KEY")
api_secret = os.getenv("LIVEKIT_API_SECRET")
url = os.getenv("LIVEKIT_URL")

if not all([api_key, api_secret, url]):
    print("❌ Missing API keys. Check your .env.")
    exit(1)

async def create_dispatch():
    client = api.LiveKitAPI(url, api_key, api_secret)
    try:
        result = await client.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                agent_name="maya",
                room_name_pattern="*",   # <-- correct field
            )
        )
        print("✅ Dispatch rule created successfully!")
        print(f"Rule ID: {result.agent_dispatch_id}")
    except Exception as e:
        print(f"❌ Failed: {e}")
    finally:
        await client.aclose()

if __name__ == "__main__":
    asyncio.run(create_dispatch())