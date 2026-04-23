import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Bot, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <-- Import to get the current user

axios.defaults.withCredentials = true;

const AIChat = () => {
    const { user } = useAuth(); // <-- Get the logged-in user
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 1. Create a UNIQUE key for this exact user (fallback to 'guest' if loading)
    const userId = user?.id || user?.email || 'guest';
    const storageKey = `smart_campus_ai_chat_${userId}`;

    // 2. Initialize state from localStorage (Permanent Storage)
    const [messages, setMessages] = useState(() => {
        const savedChat = localStorage.getItem(storageKey);
        return savedChat ? JSON.parse(savedChat) : [];
    });

    // 3. MAGIC SWITCH: If a different user logs in, instantly load THEIR history
    useEffect(() => {
        const savedChat = localStorage.getItem(storageKey);
        setMessages(savedChat ? JSON.parse(savedChat) : []);
    }, [storageKey]);

    // 4. Save to localStorage every time messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } else {
            localStorage.removeItem(storageKey); // Clean up if they cleared it
        }
    }, [messages, storageKey]);

    // 5. Clear Chat Function (Only clears for the currently logged-in user)
    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem(storageKey);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Send the history exactly like we set up previously
            const chatHistory = newMessages
                .filter(msg => msg.sender !== 'system') 
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                }));

            const response = await axios.post('http://localhost:8080/api/ai/chat', {
                history: chatHistory
            });

            const aiMsg = { sender: 'ai', text: response.data.reply };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Chat error:", error);
            const errorText = error.response?.status === 401 
                ? "Unauthorized: Please log in to use the AI." 
                : "Error connecting to AI service.";
                
            setMessages(prev => [...prev, { sender: 'system', text: errorText }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* The Chat Window */}
            {isOpen && (
                <div className="flex flex-col h-[500px] w-[350px] sm:w-[400px] border rounded-2xl shadow-2xl bg-white mb-4 overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white p-4 font-bold flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <span>Smart Campus AI</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Clear Chat Button */}
                            {messages.length > 0 && (
                                <button 
                                    onClick={clearChat} 
                                    title="Clear Chat"
                                    className="hover:bg-red-500/80 p-1.5 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button 
                                onClick={() => setIsOpen(false)} 
                                title="Close"
                                className="hover:bg-white/20 p-1.5 rounded-md transition-colors ml-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 mt-10 text-sm flex flex-col items-center">
                                <Bot className="w-10 h-10 mb-2 opacity-50" />
                                Hello {user?.name?.split(' ')[0] || ''}! Ask me to find or book a resource for you.
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-[#17A38A] text-white rounded-br-sm shadow-sm' 
                                        : msg.sender === 'system'
                                        ? 'bg-red-50 border border-red-100 text-red-600'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="p-3 bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-bl-sm shadow-sm animate-pulse flex gap-1">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t bg-white flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your request..."
                            className="flex-1 p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17A38A]/50 focus:border-[#17A38A] transition-all"
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={isLoading}
                            className="bg-[#17A38A] text-white p-2.5 rounded-xl hover:bg-[#0F6657] disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 -rotate-90 ml-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center group border-2 border-white"
                >
                    <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
                </button>
            )}
        </div>
    );
};

export default AIChat;