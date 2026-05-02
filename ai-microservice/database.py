import os
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId 

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
    if asset_type is None: asset_type = ""
    if capacity is None: capacity = 0
    if date is None: date = ""

    booked_resource_ids = []
    if date:
        overlapping_bookings = list(bookings_collection.find({
            "date": date,
            "status": "APPROVED"
        }))
        booked_resource_ids = [b.get("resourceId") for b in overlapping_bookings]
    
    real_campus_assets = list(resources_collection.find())
    
    available = []
    for asset in real_campus_assets:
        db_type = asset.get("type", "")
        db_capacity = asset.get("capacity", 0)
        db_id = str(asset.get("id", asset.get("_id"))) 
        db_name = asset.get("resourceName", "Unnamed Resource")
        db_code = asset.get("resourceCode", "")
        
        display_name = f"{db_name} ({db_code})" if db_code else db_name

        if asset_type and asset_type.lower() not in db_type.lower():
            continue
        if db_capacity < capacity:
            continue
        if db_id not in booked_resource_ids:
            available.append({
                "id": db_id,
                "name": display_name,
                "type": db_type,
                "capacity": db_capacity
            })
            
    available.sort(key=lambda x: x["capacity"])
                
    if available:
        results_list = [f"• [{a['name']}|{a['id']}] - Fits {a['capacity']}" for a in available]
        results = "\n".join(results_list)
        return f"Database found these available options:\n{results}\n\nAsk the user if they want to book one."
    else:
        return f"No {asset_type}s with a capacity of at least {capacity} are available on {date}."

def create_reservation(user_id: str = "guest", resource_id: str = "", date: str = "", start_time: str = "", end_time: str = "", attendees: int = 1, purpose: str = "Automated Academic Booking Session", special_requests: str = "", user_name: str = "Campus User", user_email: str = "user@smartcampus.com", user_dept: str = "Faculty of Computing") -> str:
    print(f"\n--- [AI ACTION] Start Booking Process ---")
    print(f"Target Resource ID from AI: '{resource_id}'")
    
    clean_date = date.replace(".", "-").replace("/", "-") 
    
    def clean_time(t_str):
        t_str = t_str.replace(" ", "").lower()
        try:
            if 'pm' in t_str or 'am' in t_str:
                if ':' not in t_str:
                    t_str = t_str.replace('am', ':00am').replace('pm', ':00pm')
                return datetime.strptime(t_str, "%I:%M%p").strftime("%H:%M")
            if len(t_str) == 4 and t_str[1] == ":": 
                return "0" + t_str
        except Exception:
            pass
        return t_str

    clean_start = clean_time(start_time)
    clean_end = clean_time(end_time)

    # --- BULLETPROOF RESOURCE LOOKUP ---
    actual_name = "Unknown Resource"
    actual_block = ""
    actual_level = ""
    real_db_id = resource_id # Default to what AI gave us just in case
    
    try:
        from bson.errors import InvalidId
        obj_id = None
        try:
            obj_id = ObjectId(resource_id)
        except InvalidId:
            pass

        query = {
            "$or": [
                {"resourceCode": resource_id},
                {"_id": obj_id} if obj_id else {"_id": "never_match"},
                {"_id": resource_id},
                {"id": resource_id}
            ]
        }
        
        resource_doc = resources_collection.find_one(query)
        
        if resource_doc:
            print(f"[DEBUG] Found Resource in MongoDB: {resource_doc.get('resourceName')}")
            actual_name = resource_doc.get("resourceName", "Unknown Resource")
            actual_block = resource_doc.get("block", "")
            actual_level = resource_doc.get("level", "")
            
            # --- THE MAGIC FIX: Grab the 24-character MongoDB ID! ---
            real_db_id = str(resource_doc.get("_id"))
            print(f"[DEBUG] Swapped short code '{resource_id}' for real DB ID '{real_db_id}'")
            # --------------------------------------------------------
            
        else:
            print(f"[WARNING] Could not find resource '{resource_id}' in MongoDB!")
            
    except Exception as e:
        print(f"[ERROR] Database lookup failed: {e}")
    # -----------------------------------

    booking_payload = {
        "userId": user_id,
        "userName": user_name,
        "userEmail": user_email,
        "userDept": user_dept,
        "resourceId": real_db_id,    # <-- NOW SENDING THE REAL 24-CHAR ID!
        "resourceName": actual_name, 
        "block": actual_block,       
        "level": actual_level,       
        "date": clean_date,
        "startTime": clean_start,
        "endTime": clean_end,
        "attendees": attendees,      
        "purpose": purpose,          
        "specialRequests": special_requests, 
        "status": "PENDING"
    }
    
    print(f"[DEBUG] Payload sending to Java: {booking_payload}")
    
    try:
        response = requests.post(SPRING_BOOT_API_URL, json=booking_payload)
        if response.status_code == 201 or response.status_code == 200:
            print("[SUCCESS] Sent to Spring Boot!")
            return "Success: The reservation was created and is now PENDING admin approval."
        else:
            print(f"[ERROR] Spring Boot rejected: {response.text}")
            return f"Failed to book. Spring Boot returned error: {response.text}"
    except Exception as e:
        return f"Error contacting Java Backend: {str(e)}"
available_functions = {
    'check_asset_availability': check_asset_availability,
    'create_reservation': create_reservation,
}