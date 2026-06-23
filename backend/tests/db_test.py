from dotenv import load_dotenv
import os

from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

response = supabase.table("baseline_slots").select("*").execute()

print("Connected Successfully")
print(response.data)