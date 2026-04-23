import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Bot, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

const AIChat = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // --- NEW: Size State (Survives open/close, resets on page refresh) ---
    const [dimensions, setDimensions] = useState({ width: 380, height: 500 });
    const isResizing = useRef(false);

    const userId = user?.id || user?.email || 'guest';
    const storageKey = `smart_campus_ai_chat_${userId}`;

    const [messages, setMessages] = useState(() => {
        const savedChat = localStorage.getItem(storageKey);
        return savedChat ? JSON.parse(savedChat) : [];
    });

    useEffect(() => {
        const savedChat = localStorage.getItem(storageKey);
        setMessages(savedChat ? JSON.parse(savedChat) : []);
    }, [storageKey]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } else {
            localStorage.removeItem(storageKey);
        }
    }, [messages, storageKey]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

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

    const renderMessageContent = (text) => {
        return text.split('\n').map((line, lineIndex) => {
            const linkRegex = /\[(.*?)\]/g;
            const parts = [];
            let lastIndex = 0;
            let match;

            while ((match = linkRegex.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(line.substring(lastIndex, match.index));
                }
                const content = match[1];
                if (content.includes('|')) {
                    const [name] = content.split('|');
                    parts.push(
                        <button
                            key={match.index}
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/resources');
                            }}
                            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 bg-emerald-100 text-[#0F6657] hover:bg-emerald-200 border border-emerald-200 rounded-md transition-colors text-xs font-semibold shadow-sm"
                        >
                            {name} <ExternalLink className="w-3 h-3" />
                        </button>
                    );
                } else {
                    parts.push(match[0]);
                }
                lastIndex = linkRegex.lastIndex;
            }

            if (lastIndex < line.length) {
                parts.push(line.substring(lastIndex));
            }

            return (
                <span key={lineIndex} className="block mb-1 min-h-[1.2em]">
                    {parts.length > 0 ? parts : line}
                </span>
            );
        });
    };

    // --- NEW: Custom Drag Logic ---
    const handleMouseDown = (e, direction) => {
        e.preventDefault();
        isResizing.current = true;
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = dimensions.width;
        const startHeight = dimensions.height;

        const handleMouseMove = (moveEvent) => {
            if (!isResizing.current) return;
            
            let newWidth = startWidth;
            let newHeight = startHeight;

            // Since it's pinned to the bottom-right, dragging LEFT increases width, dragging TOP increases height
            if (direction === 'left' || direction === 'corner') {
                newWidth = startWidth + (startX - moveEvent.clientX);
            }
            if (direction === 'top' || direction === 'corner') {
                newHeight = startHeight + (startY - moveEvent.clientY);
            }

            // Prevent it from getting too small or too large
            newWidth = Math.max(300, Math.min(newWidth, window.innerWidth * 0.8));
            newHeight = Math.max(400, Math.min(newHeight, window.innerHeight * 0.8));

            setDimensions({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div 
                    // Dynamic width and height powered by state
                    style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
                    className="flex flex-col border rounded-2xl shadow-2xl bg-white mb-4 animate-in slide-in-from-bottom-5 relative overflow-hidden"
                >
                    {/* --- Custom Invisible Drag Handles --- */}
                    {/* Top Edge Handle */}
                    <div 
                        onMouseDown={(e) => handleMouseDown(e, 'top')}
                        className="absolute top-0 left-0 right-0 h-1.5 cursor-row-resize z-50 hover:bg-[#17A38A]/30 transition-colors"
                    />
                    {/* Left Edge Handle */}
                    <div 
                        onMouseDown={(e) => handleMouseDown(e, 'left')}
                        className="absolute top-0 bottom-0 left-0 w-1.5 cursor-col-resize z-50 hover:bg-[#17A38A]/30 transition-colors"
                    />
                    {/* Top-Left Corner Handle */}
                    <div 
                        onMouseDown={(e) => handleMouseDown(e, 'corner')}
                        className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-50 hover:bg-[#17A38A]/50 transition-colors rounded-tl-2xl"
                    />

                    <div className="bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white p-4 font-bold flex justify-between items-center shadow-md select-none">
                        <div className="flex items-center gap-2 pl-2">
                            <Bot className="w-5 h-5" />
                            <span>Smart Campus AI</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button onClick={clearChat} title="Clear Chat" className="hover:bg-red-500/80 p-1.5 rounded-md transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} title="Close" className="hover:bg-white/20 p-1.5 rounded-md transition-colors ml-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 mt-10 text-sm flex flex-col items-center select-none">
                                <Bot className="w-10 h-10 mb-2 opacity-50" />
                                Hello {user?.name?.split(' ')[0] || ''}! Ask me to find or book a resource for you.
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap ${
                                    msg.sender === 'user' 
                                        ? 'bg-[#17A38A] text-white rounded-br-sm shadow-sm' 
                                        : msg.sender === 'system'
                                        ? 'bg-red-50 border border-red-100 text-red-600'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                                }`}>
                                    {renderMessageContent(msg.text)}
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
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t bg-white flex gap-2 select-none">
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