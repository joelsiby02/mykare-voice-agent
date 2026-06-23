import asyncio
from db import HealthcareTools

db = HealthcareTools()

async def main():

    print("\n=== IDENTIFY USER ===")
    result = await db.identify_user("9999999999")
    print(result)

    print("\n=== REGISTER USER ===")
    result = await db.register_user(
        "9999999999",
        "Joel Sibi"
    )
    print(result)

    print("\n=== IDENTIFY AGAIN ===")
    result = await db.identify_user("9999999999")
    print(result)

    print("\n=== FETCH SLOTS ===")
    result = await db.fetch_slots("2026-06-24")
    print(result)

asyncio.run(main())