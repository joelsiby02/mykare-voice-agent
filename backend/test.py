# livekit_auth_test.py

import os
import asyncio
from dotenv import load_dotenv
from livekit import api

load_dotenv()

async def main():
    print("URL =", os.getenv("LIVEKIT_URL"))
    print("KEY PREFIX =", os.getenv("LIVEKIT_API_KEY")[:6])

    try:
        lkapi = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
        )

        rooms = await lkapi.room.list_rooms(
            api.ListRoomsRequest()
        )

        print("\nSUCCESS")
        print(rooms)

        await lkapi.aclose()

    except Exception as e:
        print("\nFAILED")
        print(type(e))
        print(e)

asyncio.run(main())