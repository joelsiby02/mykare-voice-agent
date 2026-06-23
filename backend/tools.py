from livekit.agents import function_tool
from db import HealthcareTools
import logging

logger = logging.getLogger("KareOS-Tools")
db = HealthcareTools()

@function_tool
async def identify_user(phone: str) -> str:
    """Checks if a patient profile already exists in the system using their phone number."""
    logger.info(f"TOOL DISPATCH: identify_user -> {phone}")
    return await db.identify_user(phone)

@function_tool
async def register_user(phone: str, name: str) -> str:
    """Registers a completely new patient profile into the database."""
    logger.info(f"TOOL DISPATCH: register_user -> {phone}, {name}")
    return await db.register_user(phone, name)

@function_tool
async def fetch_slots(date_str: str) -> str:
    """Queries open available hourly clinic slots for a requested date (YYYY-MM-DD)."""
    logger.info(f"TOOL DISPATCH: fetch_slots -> {date_str}")
    return await db.fetch_slots(date_str)

@function_tool
async def book_appointment(phone: str, date_str: str, time_str: str) -> str:
    """Saves a confirmed clinic appointment entry into the database."""
    logger.info(f"TOOL DISPATCH: book_appointment -> {phone}, {date_str}, {time_str}")
    return await db.book_appointment(phone, date_str, time_str)

@function_tool
async def retrieve_appointments(phone: str) -> str:
    """Fetches all upcoming and past appointment records linked to a phone number.
    Returns a formatted list with Record ID, date, time, and status.
    """
    logger.info(f"TOOL DISPATCH: retrieve_appointments -> {phone}")
    return await db.retrieve_appointments(phone)

@function_tool
async def cancel_appointment(appointment_id: int) -> str:
    """Cancels an existing scheduled appointment using its unique Record ID."""
    logger.info(f"TOOL DISPATCH: cancel_appointment -> {appointment_id}")
    return await db.cancel_appointment(appointment_id)

@function_tool
async def modify_appointment(appointment_id: int, new_date: str, new_time: str) -> str:
    """Reschedules an existing allocation record to an alternative date and time."""
    logger.info(f"TOOL DISPATCH: modify_appointment -> {appointment_id}, {new_date}, {new_time}")
    return await db.modify_appointment(appointment_id, new_date, new_time)

@function_tool
async def end_conversation() -> str:
    """Fires the call closure sequence when the patient is completely finished."""
    logger.info("TOOL DISPATCH: end_conversation")
    return await db.end_conversation()