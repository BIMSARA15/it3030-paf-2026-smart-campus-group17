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
class ChatRequest(BaseModel):
    user_id: str
    history: list[dict] 

@app.post("/chat")
def chat_with_bot(request: ChatRequest):
    # 1. Start with the core identity instructions
    messages = [SYSTEM_MESSAGE]
    
    # 2. Add the entire conversation history!
    for msg in request.history:
        messages.append({'role': msg['role'], 'content': msg['content']})
    
    # 3. Ask Ollama (It now has perfect memory)
    response = ollama.chat(model=MODEL, messages=messages, tools=TOOLS_SCHEMA)
    
    # Execute tools if requested
    if response['message'].get('tool_calls'):
        for tool in response['message']['tool_calls']:
            function_name = tool['function']['name']
            arguments = tool['function']['arguments']
            
            if function_name == 'create_reservation':
                arguments['user_id'] = request.user_id

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