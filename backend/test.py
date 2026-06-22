from dotenv import load_dotenv
import os

load_dotenv()

keys = [
    "OPENAI_API_KEY",
    "DEEPGRAM_API_KEY",
    "CARTESIA_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "LIVEKIT_URL",
    "LIVEKIT_API_KEY",
    "LIVEKIT_API_SECRET"
]

for key in keys:
    value = os.getenv(key)

    if value:
        print(f"✅ {key}")
    else:
        print(f"❌ {key}")