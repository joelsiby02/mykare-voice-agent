import asyncio
from db import HealthcareTools

tools = HealthcareTools()

async def main():

    print("\n=== REGISTER USER ===")

    print(
        await tools.register_user(
            "9999999999",
            "Jo"
        )
    )

    print("\n=== IDENTIFY USER ===")

    print(
        await tools.identify_user(
            "9999999999"
        )
    )

    print("\n=== FETCH SLOTS ===")

    print(
        await tools.fetch_slots(
            "2026-07-01"
        )
    )

    print("\n=== BOOK APPOINTMENT ===")

    print(
        await tools.book_appointment(
            "9999999999",
            "2026-07-01",
            "10:00"
        )
    )

    print("\n=== RETRIEVE ===")

    print(
        await tools.retrieve_appointments(
            "9999999999"
        )
    )

    print("\n=== MODIFY ===")

    print(
        await tools.modify_appointment(
            1,
            "2026-07-02",
            "11:00"
        )
    )

    print("\n=== RETRIEVE AFTER MODIFY ===")

    print(
        await tools.retrieve_appointments(
            "9999999999"
        )
    )

    print("\n=== CANCEL ===")

    print(
        await tools.cancel_appointment(
            1
        )
    )

    print("\n=== RETRIEVE AFTER CANCEL ===")

    print(
        await tools.retrieve_appointments(
            "9999999999"
        )
    )
asyncio.run(main())