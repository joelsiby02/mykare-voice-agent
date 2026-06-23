# token_test.py

import os
from dotenv import load_dotenv
from livekit.api import AccessToken, VideoGrants

load_dotenv()

token = (
    AccessToken(
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET")
    )
    .with_identity("test-user")
    .with_grants(
        VideoGrants(
            room_join=True,
            room="test-room"
        )
    )
    .to_jwt()
)

print("TOKEN GENERATED")
print(token[:100])