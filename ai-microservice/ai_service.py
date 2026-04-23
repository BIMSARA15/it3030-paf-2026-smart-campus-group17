from fastapi import FastAPI
from pydantic import BaseModel
import ollama

# Import your separated logic
from database import available_functions
from prompts import SYSTEM_MESSAGE, TOOLS_SCHEMA

app = FastAPI()
MODEL = 'qwen2.5:7b'

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
def chat_with_bot(request: ChatRequest):
    # Pass the system message BEFORE the user's message
    messages = [SYSTEM_MESSAGE, {'role': 'user', 'content': request.message}]
    
    # 1. Ask Ollama what to do
    response = ollama.chat(model=MODEL, messages=messages, tools=TOOLS_SCHEMA)
    
    # 2. Check if Ollama wants to use a database tool
    if response['message'].get('tool_calls'):
        for tool in response['message']['tool_calls']:
            function_name = tool['function']['name']
            arguments = tool['function']['arguments']
            
            # Inject user ID if making a reservation
            if function_name == 'create_reservation':
                arguments['user_id'] = request.user_id

            # Execute the python function from database.py
            func_to_call = available_functions[function_name]
            function_result = func_to_call(**arguments)
            
            # Feed the database results back to Ollama
            messages.append(response['message']) 
            messages.append({'role': 'tool', 'name': function_name, 'content': function_result})
            
            final_response = ollama.chat(model=MODEL, messages=messages)
            return {"reply": final_response['message']['content']}
            
    # 3. Normal text reply if no tool was needed
    return {"reply": response['message']['content']}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)