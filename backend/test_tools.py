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

asyncio.run(main())