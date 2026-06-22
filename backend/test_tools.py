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

asyncio.run(main())