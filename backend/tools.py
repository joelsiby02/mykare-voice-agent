from livekit.agents import function_tool
from db import HealthcareTools

# Instantiate your validated database utility layer
db = HealthcareTools()

@function_tool
async def identify_user(phone: str) -> str:
    """
    Checks if a patient profile already exists in the clinic system using their unique 10-digit phone number.
    Always execute this first when a patient introduces themselves or requests a new scheduling action.
    """
    print(f"TOOL: identify_user -> {phone}")
    return await db.identify_user(phone)


@function_tool
async def register_user(phone: str, name: str) -> str:
    """
    Registers a completely new patient profile into the database using their phone number and full name.
    Only execute this tool if 'identify_user' explicitly returns that the profile was not found.
    """
    print(f"TOOL: register_user -> {phone}, {name}")
    return await db.register_user(phone, name)


@function_tool
async def fetch_slots(date_str: str) -> str:
    """
    Queries and returns the list of open, available hourly medical appointment slots for a requested calendar date string.
    The date string input parameter MUST strictly follow the 'YYYY-MM-DD' formatting standard.
    """
    print(f"TOOL: fetch_slots -> {date_str}")
    return await db.fetch_slots(date_str)


@function_tool
async def book_appointment(phone: str, date_str: str, time_str: str) -> str:
    """
    Saves and confirms a chosen appointment slot for a registered phone number.
    Requires the phone number, date string format 'YYYY-MM-DD', and time string format 'HH:MM'.
    Always execute 'fetch_slots' first to ensure the requested time slot is vacant before calling this tool.
    """
    print(f"TOOL: book_appointment -> {phone}, {date_str}, {time_str}")
    return await db.book_appointment(phone, date_str, time_str)


@function_tool
async def retrieve_appointments(phone: str) -> str:
    """
    Fetches the complete historical log of all past, upcoming, or cancelled bookings linked to this patient's phone number.
    Always execute this tool first whenever a patient asks to review, change, reschedule, or cancel an appointment.
    """
    print(f"TOOL: retrieve_appointments -> {phone}")
    return await db.retrieve_appointments(phone)


@function_tool
async def cancel_appointment(appointment_id: int) -> str:
    """
    Cancels an active scheduled appointment in the system using its unique numeric Record ID.
    You must call 'retrieve_appointments' first to look up and confirm the correct appointment_id before executing this cancellation.
    """
    print(f"TOOL: cancel_appointment -> {appointment_id}")
    return await db.cancel_appointment(appointment_id)


@function_tool
async def modify_appointment(appointment_id: int, new_date: str, new_time: str) -> str:
    """
    Reschedules an existing allocation record to an alternative date and time space.
    Requires the target appointment_id, the new target date ('YYYY-MM-DD'), and the new target time ('HH:MM').
    You must call 'retrieve_appointments' first to confirm the active appointment_id before executing this modification.
    """
    print(f"TOOL: modify_appointment -> {appointment_id}, {new_date}, {new_time}")
    return await db.modify_appointment(appointment_id, new_date, new_time)


@function_tool
async def end_conversation() -> str:
    """
    Fires the final call closure and summary sequence when the patient signals they are completely finished and have no further requests.
    This will wrap up the dialogue thread and finalize their intake processing.
    """
    print("TOOL: end_conversation")
    return await db.end_conversation()
