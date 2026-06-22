import os
import json
import logging
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize our validated Supabase link
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

logger = logging.getLogger("healthcare-tools")

class HealthcareTools:
    def __init__(self, ctx_room=None):
        """
        ctx_room is optional for now so we can test these tools manually 
        via raw Python scripts before we build the LiveKit Agent loop.
        """
        self.room = ctx_room

    def _publish_metadata_state(self, intent: str, name: str = "None", phone: str = "None", date: str = "None", time: str = "None"):
        """Helper to stream real-time data extractions to the UI once LiveKit is connected."""
        if not self.room:
            return  # Skip if testing locally without a live WebRTC room
            
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
        """Checks if a patient exists by their unique phone number."""
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

        self._publish_metadata_state(
            intent="REGISTER_USER",
            name=name,
            phone=phone
        )

        try:

            # Check if user already exists
            existing = (
                supabase
                .table("users")
                .select("*")
                .eq("phone", phone)
                .execute()
            )

            if existing.data:
                return (
                    f"User already exists: "
                    f"{existing.data[0]['name']}"
                )

            # Create new user
            (
                supabase
                .table("users")
                .insert({
                    "phone": phone,
                    "name": name
                })
                .execute()
            )

            return (
                f"SUCCESS: Profile for "
                f"'{name}' created."
            )

        except Exception as e:
            return (
                f"Registration failed: {str(e)}"
            )

    async def fetch_slots(self, date_str: str) -> str:
        """Returns the list of available appointments for a requested date string format (YYYY-MM-DD)."""
        self._publish_metadata_state(intent="FETCH_SLOTS", date=date_str)
        try:
            # 1. Query currently booked instances for this specific date
            res = supabase.table("appointments").select("appointment_time").eq("appointment_date", date_str).eq("status", "confirmed").execute()
            booked_times = [item['appointment_time'][:5] for item in res.data] # Extract HH:MM
            
            # 2. Fetch our baseline operational slot limits
            base_res = supabase.table("baseline_slots").select("slot_time").execute()
            all_slots = [item['slot_time'][:5] for item in base_res.data]
            
            # 3. Filter open segments
            available_slots = [slot for slot in all_slots if slot not in booked_times]
            if not available_slots:
                return f"Notice: All appointments for {date_str} are fully booked. Ask the patient for another date."
            return f"Open slots available on {date_str}: {', '.join(available_slots)}"
        except Exception as e:
            return f"System error pulling availability: {str(e)}"

    async def book_appointment(self, phone: str, date_str: str, time_str: str) -> str:
        """Saves a confirmed clinic appointment entry into the system repository."""
        self._publish_metadata_state(intent="BOOK_APPOINTMENT", phone=phone, date=date_str, time=time_str)
        try:
            # Validation Step: Ensure phone is registered first
            user_check = supabase.table("users").select("name").eq("phone", phone).execute()
            if not user_check.data:
                return "Operation rejected: This phone record is unregistered. Register profile before saving appointment details."

            data = {"phone": phone, "appointment_date": date_str, "appointment_time": time_str, "status": "confirmed"}
            supabase.table("appointments").insert(data).execute()
            return f"SUCCESS: Appointment successfully logged for {date_str} at {time_str}."
        except Exception as e:
            # Smart race condition intercept to catch the UNIQUE database constraint (Double Booking)
            if "unique_slot" in str(e) or "duplicate key" in str(e).lower():
                return f"REJECTION: The slot {time_str} on {date_str} was just reserved by another user. Inform the patient, view slots, and choose another time."
            return f"Booking execution failure: {str(e)}"

    async def retrieve_appointments(self, phone: str) -> str:
        """Fetches the log records of historical and pending bookings linked to this patient identifier."""
        self._publish_metadata_state(intent="RETRIEVE_APPOINTMENTS", phone=phone)
        try:
            res = supabase.table("appointments").select("*").eq("phone", phone).order("appointement_date").execute()
            if not res.data:
                return "Zero active appointments found associated with this record."
            summary = [f"Record ID: {a['id']} | Date: {a['appointment_date']} | Slot: {a['appointment_time']} | State: {a['status']}" for a in res.data]
            return "Found the following entries:\n" + "\n".join(summary)
        except Exception as e:
            return f"Failed to pull historical logs: {str(e)}"

    async def cancel_appointment(self, appointment_id: int) -> str:
        """Sets the system flag of a scheduled appointment ID to 'cancelled'."""
        self._publish_metadata_state(intent="CANCEL_APPOINTMENT")
        try:
            supabase.table("appointments").update({"status": "cancelled"}).eq("id", appointment_id).execute()
            return f"Appointment Record ID {appointment_id} has been marked as cancelled successfully."
        except Exception as e:
            return f"Cancellation pipeline error: {str(e)}"

    async def modify_appointment(self, appointment_id: int, new_date: str, new_time: str) -> str:
        """Reschedules an allocation item to an alternative calendar target space."""
        self._publish_metadata_state(intent="MODIFY_APPOINTMENT", date=new_date, time=new_time)
        try:
            supabase.table("appointments").update({
                "appointment_date": new_date,
                "appointment_time": new_time,
                "status": "confirmed"
            }).eq("id", appointment_id).execute()
            return f"Rescheduling successful. Appointment ID {appointment_id} updated to {new_date} at {new_time}."
        except Exception as e:
            if "unique_slot" in str(e) or "duplicate key" in str(e).lower():
                return f"CRITICAL: Destination slot {new_time} on {new_date} is full. Select an open target configuration."
            return f"Modification failed: {str(e)}"

    async def end_conversation(self) -> str:
        self._publish_metadata_state(intent="END_CONVERSATION")
        return "Conversation completed successfully."