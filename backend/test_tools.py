import asyncio
from db import HealthcareTools

tools = HealthcareTools()

async def main():

    print(
        await tools.register_user(
            "9999999999",
            "Jo"
        )
    )

    print(
        await tools.identify_user(
            "9999999999"
        )
    )

    print(
    await tools.fetch_slots(
        "2026-07-01"
    )
)

    print(
            await tools.book_appointment(
                "9999999999",
                "2026-07-01",
                "10:00"
            )
        )
    
    print(
            await tools.retrieve_appointments(
                "9999999999"
            )
        )
asyncio.run(main())