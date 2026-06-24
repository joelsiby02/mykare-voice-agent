import os
import json
import re
import logging
from datetime import datetime, timedelta, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Setup standardized logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("KareOS-Engine")

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class HealthcareTools:
    def __init__(self, ctx_room=None):
        self.room = ctx_room

    def _get_ist_date(self):
        """Return today's date in Indian Standard Time (UTC+5:30)."""
        utc_now = datetime.now(timezone.utc)
        ist_offset = timedelta(hours=5, minutes=30)
        return (utc_now + ist_offset).date()

    def _sanitize_date(self, date_str: str) -> str:
        """Force the year to 2026 if the LLM provides an incorrect one."""
        try:
            parts = date_str.split("-")
            if len(parts) == 3 and parts[0] != "2026":
                logger.warning(f"[DATE SANITIZATION] Overwriting year from {parts[0]} to 2026")
                return f"2026-{parts[1]}-{parts[2]}"
            return date_str
        except Exception as e:
            logger.error(f"Failed to sanitize date string: {e}")
            return date_str

    def _format_time(self, time_str: str) -> str:
        """Convert 24-hour time (HH:MM) to 12-hour format (HH:MM AM/PM)."""
        try:
            hour = int(time_str.split(":")[0])
            minute = time_str.split(":")[1]
            period = "AM" if hour < 12 else "PM"
            hour_12 = hour % 12
            if hour_12 == 0:
                hour_12 = 12
            return f"{hour_12}:{minute} {period}"
        except:
            return time_str

    # ========== EDGE-CASE VALIDATION HELPERS ==========
    def _validate_phone(self, phone: str) -> bool:
        """
        Validate that the phone number is a valid 10-digit Indian number.
        Strips non-digit characters, checks length == 10 and all digits.
        """
        if not phone:
            return False
        cleaned = re.sub(r'\D', '', phone)  # remove non-digits
        return len(cleaned) == 10 and cleaned.isdigit()

    def _validate_inputs(self, phone: str = None, name: str = None, 
                         date_str: str = None, time_str: str = None) -> str:
        """
        Check required fields and return a rejection message if any is missing or empty.
        Returns None if all present.
        """
        if phone is not None and not phone.strip():
            return "Phone number is required. Please ask the patient to provide their 10-digit phone number."
        if name is not None and not name.strip():
            return "Full name is required. Please ask the patient to provide their full name."
        if date_str is not None and not date_str.strip():
            return "Appointment date is required. Please ask the patient to provide a valid date (YYYY-MM-DD)."
        if time_str is not None and not time_str.strip():
            return "Appointment time is required. Please ask the patient to provide a valid time."
        return None
    # ================================================

    def _publish_metadata_state(self, intent: str, name: str = "None", phone: str = "None",
                                date: str = "None", time: str = "None"):
        """Stream real-time extracted data to the frontend via metadata."""
        if not self.room:
            return
        payload = {
            "intent": intent,
            "extracted_data": {
                "name": name,
                "phone": phone,
                "date": date,
                "time": time
            }
        }
        try:
            self.room.local_participant.publish_metadata(json.dumps(payload))
        except Exception as e:
            logger.error(f"Failed to publish track metadata: {e}")

    async def identify_user(self, phone: str) -> str:
        # --- Edge case: invalid phone ---
        if not self._validate_phone(phone):
            logger.warning(f"Invalid phone number received: {phone}")
            return "REJECTION: The phone number provided is not a valid 10-digit number. Please ask the patient to provide their full 10-digit phone number."

        logger.info(f"[EXECUTION] identify_user triggered -> {phone}")
        self._publish_metadata_state(intent="IDENTIFY_USER", phone=phone)
        try:
            res = supabase.table("users").select("*").eq("phone", phone).execute()
            if res.data:
                user = res.data[0]
                self._publish_metadata_state(intent="IDENTIFY_USER", name=user['name'], phone=phone)
                return f"User verified. Name: {user['name']}. Proceed with their booking request."
            return "Profile not found. Prompt the user for their full name to create a registration profile."
        except Exception as e:
            return f"System error identifying user: {str(e)}"

    async def register_user(self, phone: str, name: str) -> str:
        # --- Edge cases: invalid phone, missing name ---
        if not self._validate_phone(phone):
            logger.warning(f"Invalid phone for registration: {phone}")
            return "REJECTION: Invalid phone number. Please ask the patient to provide a valid 10-digit phone number."
        missing = self._validate_inputs(name=name)
        if missing:
            logger.warning(f"Registration missing field: {missing}")
            return "REJECTION: " + missing

        logger.info(f"[EXECUTION] register_user triggered -> {phone}, {name}")
        self._publish_metadata_state(intent="REGISTER_USER", name=name, phone=phone)
        try:
            existing = supabase.table("users").select("*").eq("phone", phone).execute()
            if existing.data:
                return f"User already exists: {existing.data[0]['name']}"

            supabase.table("users").insert({"phone": phone, "name": name}).execute()
            return f"SUCCESS: Profile for '{name}' created."
        except Exception as e:
            return f"Registration failed: {str(e)}"

    async def fetch_slots(self, date_str: str) -> str:
        # --- Edge case: missing date ---
        missing = self._validate_inputs(date_str=date_str)
        if missing:
            logger.warning(f"fetch_slots missing date: {date_str}")
            return "REJECTION: " + missing

        date_str = self._sanitize_date(date_str)
        logger.info(f"[EXECUTION] fetch_slots triggered -> {date_str}")
        self._publish_metadata_state(intent="FETCH_SLOTS", date=date_str)

        try:
            try:
                input_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                today_ist = self._get_ist_date()
                if input_date < today_ist:
                    return (f"REJECTION: The date {date_str} has already passed. "
                            f"Today is currently {today_ist}. Explain this temporal mismatch politely "
                            "and ask for a current or future target date.")
            except ValueError:
                return "REJECTION: Invalid date format passed. Ensure format is strictly YYYY-MM-DD."

            # Get booked times
            booked_res = supabase.table("appointments") \
                .select("appointment_time") \
                .eq("appointment_date", date_str) \
                .eq("status", "confirmed") \
                .execute()
            booked_times = [item['appointment_time'][:5] for item in booked_res.data]

            # Get all possible slots
            base_res = supabase.table("baseline_slots").select("slot_time").execute()
            all_slots = [item['slot_time'][:5] for item in base_res.data]

            available = [slot for slot in all_slots if slot not in booked_times]
            if not available:
                return f"Notice: All appointments for {date_str} are fully booked. Ask the patient for another date."
            
            # Format available slots to AM/PM
            available_formatted = [self._format_time(slot) for slot in available]
            return (f"Open slots available on date {date_str}: {', '.join(available_formatted)}. "
                    "If the user picks a time outside this list, remind them of our opening slots.")
        except Exception as e:
            return f"System error pulling availability: {str(e)}"

    async def book_appointment(self, phone: str, date_str: str, time_str: str) -> str:
        # --- Edge cases: phone length, missing fields ---
        if not self._validate_phone(phone):
            logger.warning(f"Invalid phone for booking: {phone}")
            return "REJECTION: Invalid phone number. Please ask the patient to provide a valid 10-digit phone number."
        missing = self._validate_inputs(phone=phone, date_str=date_str, time_str=time_str)
        if missing:
            logger.warning(f"Booking missing field: {missing}")
            return "REJECTION: " + missing

        date_str = self._sanitize_date(date_str)
        logger.info(f"[EXECUTION] book_appointment triggered -> {phone}, {date_str}, {time_str}")
        self._publish_metadata_state(intent="BOOK_APPOINTMENT", phone=phone, date=date_str, time=time_str)

        try:
            # Validate date
            try:
                input_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                today_ist = self._get_ist_date()
                if input_date < today_ist:
                    return (f"REJECTION: Cannot schedule an appointment in the past. The target {date_str} has passed. "
                            f"Today is {today_ist}. Inform the patient and request an upcoming timeline slot.")
            except ValueError:
                return "REJECTION: Target date structure must equal YYYY-MM-DD."

            # Validate time against baseline slots
            clean_time = time_str[:5]
            base_res = supabase.table("baseline_slots").select("slot_time").execute()
            allowed_slots = [item['slot_time'][:5] for item in base_res.data]
            if clean_time not in allowed_slots:
                return (f"REJECTION: {time_str} is outside clinic operational slots. "
                        f"Our exact open segments are {', '.join(allowed_slots)}. "
                        "Ask the patient to select one of these active slots.")

            # Check user exists
            user_check = supabase.table("users").select("name").eq("phone", phone).execute()
            if not user_check.data:
                return "Operation rejected: This phone record is unregistered. Register profile before saving appointment details."

            # Insert appointment
            data = {
                "phone": phone,
                "appointment_date": date_str,
                "appointment_time": time_str,
                "status": "confirmed"
            }
            supabase.table("appointments").insert(data).execute()
            return f"SUCCESS: Appointment successfully logged for {date_str} at {time_str}."

        except Exception as e:
            if "unique_slot" in str(e) or "duplicate key" in str(e).lower():
                return (f"REJECTION: The slot {time_str} on {date_str} was just reserved by another user. "
                        "Inform the patient, view slots, and choose another time.")
            return f"Booking execution failure: {str(e)}"

    async def retrieve_appointments(self, phone: str) -> str:
        # --- Edge case: invalid phone ---
        if not self._validate_phone(phone):
            logger.warning(f"Invalid phone for retrieval: {phone}")
            return "REJECTION: Invalid phone number. Please ask the patient to provide their 10-digit phone number."

        logger.info(f"[EXECUTION] retrieve_appointments triggered -> {phone}")
        self._publish_metadata_state(intent="RETRIEVE_APPOINTMENTS", phone=phone)
        try:
            res = supabase.table("appointments") \
                .select("*") \
                .eq("phone", phone) \
                .order("appointment_date") \
                .execute()
            if not res.data:
                return "Zero active appointments found associated with this record."
            summary = [
                f"Record ID: {a['id']} | Date: {a['appointment_date']} | Slot: {a['appointment_time']} | State: {a['status']}"
                for a in res.data
            ]
            return "Found the following entries:\n" + "\n".join(summary)
        except Exception as e:
            return f"Failed to pull historical logs: {str(e)}"

    async def cancel_appointment(self, appointment_id: int) -> str:
        logger.info(f"[EXECUTION] cancel_appointment triggered -> {appointment_id}")
        self._publish_metadata_state(intent="CANCEL_APPOINTMENT")
        try:
            supabase.table("appointments") \
                .update({"status": "cancelled"}) \
                .eq("id", appointment_id) \
                .execute()
            return f"Appointment Record ID {appointment_id} has been marked as cancelled successfully."
        except Exception as e:
            return f"Cancellation pipeline error: {str(e)}"

    async def modify_appointment(self, appointment_id: int, new_date: str, new_time: str) -> str:
        # --- Edge cases: missing fields, invalid phone (optional) ---
        # We don't have phone here, but we can validate date/time presence.
        missing = self._validate_inputs(date_str=new_date, time_str=new_time)
        if missing:
            logger.warning(f"Modify missing field: {missing}")
            return "REJECTION: " + missing

        new_date = self._sanitize_date(new_date)
        logger.info(f"[EXECUTION] modify_appointment triggered -> {appointment_id}, {new_date}, {new_time}")
        self._publish_metadata_state(intent="MODIFY_APPOINTMENT", date=new_date, time=new_time)

        try:
            # Validate new date
            try:
                input_date = datetime.strptime(new_date, "%Y-%m-%d").date()
                today_ist = self._get_ist_date()
                if input_date < today_ist:
                    return f"REJECTION: Destination target {new_date} has already passed. Today is {today_ist}."
            except ValueError:
                return "REJECTION: Format must be exactly YYYY-MM-DD."

            # Update appointment
            supabase.table("appointments") \
                .update({
                    "appointment_date": new_date,
                    "appointment_time": new_time,
                    "status": "confirmed"
                }) \
                .eq("id", appointment_id) \
                .execute()
            return f"Rescheduling successful. Appointment ID {appointment_id} updated to {new_date} at {new_time}."

        except Exception as e:
            if "unique_slot" in str(e) or "duplicate key" in str(e).lower():
                return (f"CRITICAL: Destination slot {new_time} on {new_date} is full. "
                        "Select an open target configuration.")
            return f"Modification failed: {str(e)}"

    async def end_conversation(self) -> str:
        logger.info("[EXECUTION] end_conversation triggered")
        self._publish_metadata_state(intent="END_CONVERSATION")
        return "Conversation completed successfully."