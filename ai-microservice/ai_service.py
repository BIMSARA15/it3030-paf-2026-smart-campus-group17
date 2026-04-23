from fastapi import FastAPI
from pydantic import BaseModel
import ollama
import json  # <-- ADD THIS
import re    # <-- ADD THIS

# Import your separated logic
from database import available_functions
from prompts import SYSTEM_MESSAGE, TOOLS_SCHEMA

app = FastAPI()
MODEL = 'qwen2.5:7b'
#MODEL = 'qwen3:4b'
#MODEL = 'gemma3:4b'             

# 👈 FIX: Python now expects the history array from Java
# 1. Update the Request Model
class ChatRequest(BaseModel):
    user_id: str
    user_name: str     # <-- NEW
    user_email: str    # <-- NEW
    history: list[dict] 

@app.post("/chat")
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
            # Find the JSON brackets inside the messy text
            json_match = re.search(r'(\{.*?\})', message_content)
            if json_match:
                arguments = json.loads(json_match.group(1))
                
                # Inject secure details
                arguments['user_id'] = request.user_id
                arguments['user_name'] = getattr(request, 'user_name', 'Campus User')
                arguments['user_email'] = getattr(request, 'user_email', 'user@smartcampus.com')
                
                # Force the tool to run!
                function_result = available_functions['create_reservation'](**arguments)
                
                messages.append({'role': 'assistant', 'content': message_content})
                messages.append({'role': 'tool', 'name': 'create_reservation', 'content': function_result})
                
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