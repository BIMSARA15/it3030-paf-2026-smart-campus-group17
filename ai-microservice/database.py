import os
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
SPRING_BOOT_API_URL = os.getenv("SPRING_BOOT_API_URL")

# Connect to Real MongoDB
client = MongoClient(MONGO_URI)
db = client["smart_campus_db"] 
bookings_collection = db["bookings"]
resources_collection = db["resources"]

def check_asset_availability(asset_type: str = "", capacity: int = 0, date: str = "", start_time: str = "", end_time: str = "") -> str:
    """Queries MongoDB to find resources, matching exact or larger capacities."""
    print(f"[AI DB SEARCH] Looking for {asset_type} | Capacity >= {capacity} | Date: {date}")
    
    booked_resource_ids = []
    if date:
        overlapping_bookings = list(bookings_collection.find({
            "date": date,
            "status": "APPROVED"
        }))
        booked_resource_ids = [b.get("resourceId") for b in overlapping_bookings]
    
    # --- REAL-TIME DATABASE FETCH ---
    # Fetch all resources directly from your MongoDB Atlas collection
    real_campus_assets = list(resources_collection.find())
    
    available = []
    for asset in real_campus_assets:
        # Use .get() safely in case some database items are missing fields
        db_type = asset.get("type", "")
        db_capacity = asset.get("capacity", 0)
        
        # MongoDB uses "_id" internally, but your Java code might save a custom "id" string. We check both.
        db_id = str(asset.get("id", asset.get("_id"))) 
        db_name = asset.get("name", "Unnamed Resource")

        # 1. Filter by type (if user specified one)
        if asset_type and asset_type.lower() not in db_type.lower():
            continue
            
        # 2. Filter by capacity (Find exact OR LARGER)
        if db_capacity < capacity:
            continue
            
        # 3. Filter by availability (Check if it's already booked)
        if db_id not in booked_resource_ids:
            # Format the data cleanly for the sorting function
            available.append({
                "id": db_id,
                "name": db_name,
                "type": db_type,
                "capacity": db_capacity
            })
            
    # SORT the available list so the closest matching capacity is first
    available.sort(key=lambda x: x["capacity"])
                
    if available:
        results = ", ".join([f"{a['name']} (Fits {a['capacity']})" for a in available])
        return f"Database found these available options: {results}. Tell the user the closest matches and ask if they want to book one."
    else:
        return f"No {asset_type}s with a capacity of at least {capacity} are available on {date}."

def create_reservation(user_id: str, resource_id: str, date: str, start_time: str, end_time: str, attendees: int) -> str:
    """Sends a POST request to Spring Boot to create the booking."""
    print(f"[AI ACTION] Forwarding booking request to Spring Boot for {resource_id}...")
    
    booking_payload = {
        "userId": user_id,
        "resourceId": resource_id,
        "date": date,
        "startTime": start_time,
        "endTime": end_time,
        "attendees": attendees,
        "purpose": "AI Assistant Automated Booking",
        "status": "PENDING"
    }
    
    try:
        response = requests.post(SPRING_BOOT_API_URL, json=booking_payload)
        if response.status_code == 201 or response.status_code == 200:
            return "Success: The reservation was created and the Spring Boot server has triggered the pending email and admin notifications."
        else:
            return f"Failed to book. Spring Boot returned error: {response.text}"
    except Exception as e:
        return f"Error contacting Java Backend: {str(e)}"

# A dictionary to easily map function names to the actual code
available_functions = {
    'check_asset_availability': check_asset_availability,
    'create_reservation': create_reservation,
}