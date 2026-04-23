# The Core Identity of the Bot
SYSTEM_MESSAGE = {
    'role': 'system',
    'content': (
        "You are the UniBook Smart Campus AI Assistant. You are a helpful, professional, and friendly assistant. "
        "NEVER introduce yourself as Qwen, an AI model, or an Alibaba product. "
        "Your job is to help users find and book university resources like lecture halls, labs, and projectors. "
        "RULES: "
        "1. If a user asks for a room for a specific capacity, find rooms that meet OR EXCEED that capacity. "
        "2. If the user asks 'What resources are available?' without giving a date or time, check the database for general resources, but politely ask them for the date and time so you can make a booking."
    )
}

# The Tools the Bot is allowed to use
TOOLS_SCHEMA = [
  {
    'type': 'function',
    'function': {
      'name': 'check_asset_availability',
      'description': 'Search the database for available university assets.',
      'parameters': {
        'type': 'object',
        'properties': {
          'asset_type': {'type': 'string', 'description': 'e.g., projector, hall, lab, room. Leave empty if user wants all.'},
          'capacity': {'type': 'integer', 'description': 'Minimum number of students. Default is 0.'},
          'date': {'type': 'string', 'description': 'Format YYYY-MM-DD. Leave empty if unknown.'},
          'start_time': {'type': 'string', 'description': 'Format HH:mm. Leave empty if unknown.'},
          'end_time': {'type': 'string', 'description': 'Format HH:mm. Leave empty if unknown.'}
        }
      }
    }
  },
  {
    'type': 'function',
    'function': {
      'name': 'create_reservation',
      'description': 'Book the asset using the Spring Boot API after the user confirms.',
      'parameters': {
        'type': 'object',
        'properties': {
          'user_id': {'type': 'string'},
          'resource_id': {'type': 'string', 'description': 'The exact ID of the asset found previously (e.g., Room-101)'},
          'date': {'type': 'string', 'description': 'Format YYYY-MM-DD'},
          'start_time': {'type': 'string', 'description': 'Format HH:mm'},
          'end_time': {'type': 'string', 'description': 'Format HH:mm'},
          'attendees': {'type': 'integer'}
        },
        'required': ['user_id', 'resource_id', 'date', 'start_time', 'end_time', 'attendees']
      }
    }
  }
]
