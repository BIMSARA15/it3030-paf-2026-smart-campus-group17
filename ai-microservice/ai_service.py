from fastapi import FastAPI
from pydantic import BaseModel
import ollama

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
    
    if response['message'].get('tool_calls'):
        for tool in response['message']['tool_calls']:
            function_name = tool['function']['name']
            arguments = tool['function']['arguments']
            
            # 2. Silently inject ALL the user's details! The AI doesn't even know it's happening.
            if function_name == 'create_reservation':
                arguments['user_id'] = request.user_id
                arguments['user_name'] = request.user_name
                arguments['user_email'] = request.user_email

            func_to_call = available_functions[function_name]
            function_result = func_to_call(**arguments)
            
            messages.append(response['message']) 
            messages.append({'role': 'tool', 'name': function_name, 'content': function_result})
            
            final_response = ollama.chat(model=MODEL, messages=messages)
            return {"reply": final_response['message']['content']}
            
    return {"reply": response['message']['content']}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)