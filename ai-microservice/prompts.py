from datetime import datetime

# Convert to a function so it grabs the FRESH time on every single request
def get_system_message():
    # Get real-time date info
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")
    current_day = now.strftime("%A")

    return {
        'role': 'system',
        'content': (
            f"You are the UniBook Smart Campus AI Assistant. "
            f"CRITICAL REAL-TIME INFO: Today is {current_day}, {current_date} and the current time is {current_time}. "
            f"You MUST use this exact date to calculate relative terms like 'today', 'tomorrow', 'next Monday', etc. "
            "RULES: "
            "1. SMART FORM FILLING: Your goal is to ensure every booking request is VALID for the Spring Boot backend. "
            "2. PURPOSE FIELD: If the user doesn't provide a purpose, you MUST generate a professional one at least 15 characters long. "
            "   - Example for a Lab: 'Academic practical session and research work for students.' "
            "   - Example for a Hall: 'Lecture session and student presentation for the current semester.' "
            "3. ATTENDEES FIELD: If the user doesn't specify the number of students, look at the resource's 'Fits X' capacity from your previous search results and use that number as the default. Do not exceed 150. "
            "4. DIRECT BOOKING: If the user provides a resource, date, and time, trigger 'create_reservation' IMMEDIATELY. "
            "5. ANTI-HALLUCINATION: Do not confirm a booking until you receive a 'Success' message from the tool."
        )
    }

# The Tools the Bot is allowed to use
TOOLS_SCHEMA = [
  {
    'type': 'function',
    'function': {
      'name': 'check_asset_availability',
      'description': 'Search the database for available university assets. Use when the user wants to see what is available.',
      'parameters': {
        'type': 'object',
        'properties': {
          'asset_type': {'type': 'string'},
          'capacity': {'type': 'integer'},
          'date': {'type': 'string'},
          'start_time': {'type': 'string'},
          'end_time': {'type': 'string'}
        }
      }
    }
  },
  {
    'type': 'function',
    'function': {
      'name': 'create_reservation',
      'description': 'Submit a booking request. All fields are mandatory for the backend.',
      'parameters': {
        'type': 'object',
        'properties': {
          'resource_id': {'type': 'string', 'description': 'The exact ID/Code of the asset (e.g., C-321).'},
          'date': {'type': 'string', 'description': 'Format YYYY-MM-DD.'},
          'start_time': {'type': 'string', 'description': '24-hour format (e.g., 14:00).'},
          'end_time': {'type': 'string', 'description': '24-hour format (e.g., 16:00).'},
          'attendees': {'type': 'integer', 'description': 'Number of students. Use resource capacity if unknown. Max 150.'},
          'purpose': {'type': 'string', 'description': 'Minimum 15 characters. Describe the academic use of the room.'},
          'special_requests': {'type': 'string', 'description': 'Any specific equipment, setup, or accessibility requests mentioned by the user. Leave completely empty if they did not ask for anything special.'}
        },
        'required': ['resource_id', 'date', 'start_time', 'end_time', 'attendees', 'purpose'] 
      }
    }
  }
]