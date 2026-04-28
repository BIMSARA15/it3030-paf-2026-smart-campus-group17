import os
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Depends
from pydantic import BaseModel
import ollama
import json  
import re    

# Import your separated logic
from database import available_functions
from prompts import SYSTEM_MESSAGE, TOOLS_SCHEMA

# --- SECURITY SETUP ---
# Load the secret from the .env file
load_dotenv()
# If the .env is missing, it will safely default to a placeholder
SECRET_TOKEN = os.getenv("UNIBOOKING_AI_TOKEN", "your_super_secret_token_here_12345")

app = FastAPI()
MODEL = 'qwen2.5:7b'
#MODEL = 'qwen3:4b'
#MODEL = 'gemma3:4b'             

# Create a security dependency
def verify_token(authorization: str = Header(None)):
    if not authorization or authorization != f"Bearer {SECRET_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing token")

# 1. Update the Request Model
class ChatRequest(BaseModel):
    user_id: str
    user_name: str     
    user_email: str    
    history: list[dict] 

# --- PROTECTED ROUTE:  dependency ---
@app.post("/api/chat", dependencies=[Depends(verify_token)])
def chat_with_bot(request: ChatRequest):
    messages = [SYSTEM_MESSAGE]
    safe_history = request.history[-6:] 
    
    for msg in safe_history:
        messages.append({'role': msg['role'], 'content': msg['content']})
    
    response = ollama.chat(model=MODEL, messages=messages, tools=TOOLS_SCHEMA)
    message_content = response['message'].get('content', '')

    # --- THE INTERCEPTOR: Catch Leaked AI Code ---
    if "create_reservation" in message_content and "{" in message_content:
        print("\n[🛡️ INTERCEPTOR] Caught the AI leaking tool syntax! Forcing execution...")
        try:
            json_str = re.search(r'\{.*\}', message_content, re.DOTALL)
            if json_str:
                args = json.loads(json_str.group(0))
                
                args['user_id'] = request.user_id
                args['user_name'] = getattr(request, 'user_name', 'Campus User')
                args['user_email'] = getattr(request, 'user_email', 'user@smartcampus.com')

                print(f"[INTERCEPTOR] Running create_reservation with: {args}")
                
                tool_result = available_functions['create_reservation'](**args)
                
                messages.append(response['message'])
                messages.append({'role': 'tool', 'name': 'create_reservation', 'content': tool_result})
                
                final_response = ollama.chat(model=MODEL, messages=messages)
                return {"reply": final_response['message']['content']}
        except Exception as e:
            print(f"[ERROR] Interceptor failed to parse: {e}")
    # ----------------------------------------------

    # Standard proper tool execution (If the AI behaves correctly)
    if response['message'].get('tool_calls'):
        for tool in response['message']['tool_calls']:
            function_name = tool['function']['name']
            arguments = tool['function']['arguments']
            
            if function_name == 'create_reservation':
                arguments['user_id'] = request.user_id
                arguments['user_name'] = getattr(request, 'user_name', 'Campus User')
                arguments['user_email'] = getattr(request, 'user_email', 'user@smartcampus.com')

            func_to_call = available_functions[function_name]
            function_result = func_to_call(**arguments)
            
            messages.append(response['message']) 
            messages.append({'role': 'tool', 'name': function_name, 'content': function_result})
            
            final_response = ollama.chat(model=MODEL, messages=messages)
            return {"reply": final_response['message']['content']}
            
    return {"reply": message_content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)