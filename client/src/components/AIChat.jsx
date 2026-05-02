import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Building2, FlaskConical, Wrench, MapPin, Users,
  Calendar, Clock, AlertCircle, CheckCircle, ChevronRight,
  ChevronLeft, Info, Loader2, User, MessageSquare, MessageCircle, X, Package, Tag,
  Bot, Sparkles, GraduationCap, Zap, Brain, ChevronDown, Star, Send, Trash2, ExternalLink, Settings2, Laptop, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

axios.defaults.withCredentials = true;

const ICON_OPTIONS = [
  { id: "sparkles", Icon: Sparkles,      label: "Sparkles" },
  { id: "bot",      Icon: Bot,           label: "Robot" },
  { id: "grad",     Icon: GraduationCap, label: "Campus" },
  { id: "zap",      Icon: Zap,           label: "Quick" },
  { id: "brain",    Icon: Brain,         label: "Smart" },
  { id: "msg",      Icon: MessageCircle, label: "Chat" },
];

const SIZE_PRESETS = [
  { label: "XS", size: 40, iconSize: 16 },
  { label: "S",  size: 52, iconSize: 20 },
  { label: "M",  size: 64, iconSize: 26 },
  { label: "L",  size: 76, iconSize: 30 },
  { label: "XL", size: 92, iconSize: 36 },
];

const quickActions = [
  { label: "Book a Room",        icon: MapPin,   color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  { label: "Reserve Equipment",  icon: Laptop,   color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  { label: "Lab Booking",        icon: BookOpen, color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { label: "View Schedule",      icon: Calendar, color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
  { label: "Show All Resources",    icon: Users,    color: "bg-red-100 text-red-700 hover:bg-red-200" },
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AIChat() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Core State ---
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // --- New UI State ---
  const [showControls, setShowControls] = useState(false);
  const [buttonSize, setButtonSize] = useState(64);
  const [iconSize, setIconSize] = useState(26);
  const [selectedIcon, setSelectedIcon] = useState("sparkles");
  const [unread, setUnread] = useState(0);
  const inputRef = useRef(null);
  const controlsRef = useRef(null);

  // --- Resizing State ---
  const [dimensions, setDimensions] = useState({ width: 370, height: 570 });
  const isResizing = useRef(false);

  const userId = user?.id || user?.email || 'guest';
  const storageKey = `smart_campus_ai_chat_${userId}`;

  // --- DYNAMIC ROLE THEME ---
  const theme = useMemo(() => {
    const role = (user?.role || '').toUpperCase();
    const isAdmin = role === 'ADMIN';
    const isLecturer = role === 'LECTURER';
    const isTechnician = role === 'TECHNICIAN';

    if (isAdmin) return {
      gradient: 'from-[#1E3A8A] to-[#2563EB]',
      userBubble: 'from-[#1e40af] to-[#1d4ed8]',
      textLight: 'text-blue-200',
      typingDot: 'bg-blue-400',
      focusBorder: 'focus-within:border-blue-400',
      sendBtn: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
      linkBg: 'bg-blue-50',
      linkText: 'text-blue-700',
      linkHover: 'hover:bg-blue-100',
      linkBorder: 'border-blue-200',
      controlsActiveBg: 'bg-blue-50',
      controlsActiveBorder: 'border-blue-500',
      controlsBtnActive: 'bg-blue-600',
      svgStop1: '#1E3A8A', svgStop2: '#2563EB'
    };
    if (isLecturer) return {
      gradient: 'from-[#8A3505] to-[#C54E08]',
      userBubble: 'from-[#9a3c06] to-[#c54e08]',
      textLight: 'text-orange-200',
      typingDot: 'bg-orange-400',
      focusBorder: 'focus-within:border-orange-400',
      sendBtn: 'linear-gradient(135deg, #8A3505, #C54E08)',
      linkBg: 'bg-orange-50',
      linkText: 'text-[#A74106]',
      linkHover: 'hover:bg-orange-100',
      linkBorder: 'border-orange-200',
      controlsActiveBg: 'bg-orange-50',
      controlsActiveBorder: 'border-[#A74106]',
      controlsBtnActive: 'bg-[#A74106]',
      svgStop1: '#8A3505', svgStop2: '#C54E08'
    };
    if (isTechnician) return {
      gradient: 'from-[#27324A] to-[#303B53]',
      userBubble: 'from-[#2e3b57] to-[#3b4b6b]',
      textLight: 'text-slate-300',
      typingDot: 'bg-slate-400',
      focusBorder: 'focus-within:border-slate-400',
      sendBtn: 'linear-gradient(135deg, #27324A, #303B53)',
      linkBg: 'bg-slate-100',
      linkText: 'text-slate-700',
      linkHover: 'hover:bg-slate-200',
      linkBorder: 'border-slate-300',
      controlsActiveBg: 'bg-slate-100',
      controlsActiveBorder: 'border-slate-500',
      controlsBtnActive: 'bg-slate-600',
      svgStop1: '#27324A', svgStop2: '#303B53'
    };
    // Default (Student)
    return {
      gradient: 'from-[#0F6657] to-[#17A38A]',
      userBubble: 'from-[#0f6657] to-[#128a74]',
      textLight: 'text-emerald-200',
      typingDot: 'bg-emerald-400',
      focusBorder: 'focus-within:border-emerald-400',
      sendBtn: 'linear-gradient(135deg, #0F6657, #17A38A)',
      linkBg: 'bg-emerald-50',
      linkText: 'text-[#0F6657]',
      linkHover: 'hover:bg-emerald-100',
      linkBorder: 'border-emerald-200',
      controlsActiveBg: 'bg-emerald-50',
      controlsActiveBorder: 'border-[#0F6657]',
      controlsBtnActive: 'bg-[#0F6657]',
      svgStop1: '#0F6657', svgStop2: '#17A38A'
    };
  }, [user?.role]);

  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem(storageKey);
    return savedChat ? JSON.parse(savedChat) : [
      {
        id: "1",
        sender: "ai",
        text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm **CampusBot**, your smart campus asset booking assistant.\n\nHow can I help you today?`,
        time: getTime(),
      }
    ];
  });

  // Load / Save Chat
  useEffect(() => {
    const savedChat = localStorage.getItem(storageKey);
    if (savedChat) setMessages(JSON.parse(savedChat));
  }, [storageKey]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [messages, storageKey]);

  // Scrolling & Auto-Focus
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Outside click for controls
  useEffect(() => {
    const handler = (e) => {
      if (controlsRef.current && !controlsRef.current.contains(e.target)) {
        setShowControls(false);
      }
    };
    if (showControls) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showControls]);

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      sender: "ai",
      text: `Chat cleared! How can I help you, ${user?.name?.split(' ')[0] || 'there'}?`,
      time: getTime(),
    }]);
    localStorage.removeItem(storageKey);
  };

  const sendMessage = async (overrideText = null) => {
    const textToProcess = overrideText || input;
    if (!textToProcess.trim()) return;

    const userMsg = { sender: 'user', text: textToProcess, time: getTime() };
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

      const aiMsg = { sender: 'ai', text: response.data.reply, time: getTime() };
      setMessages(prev => [...prev, aiMsg]);
      
      if (!isOpen) setUnread(u => u + 1);

    } catch (error) {
      console.error("Chat error:", error);
      const errorText = error.response?.status === 401
        ? "Unauthorized: Please log in to use the AI."
        : "Error connecting to AI service.";
      setMessages(prev => [...prev, { sender: 'system', text: errorText, time: getTime() }]);
      if (!isOpen) setUnread(u => u + 1);
    } finally {
      setIsLoading(false);
    }
  };

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

      if (direction === 'left' || direction === 'corner') {
        newWidth = startWidth + (startX - moveEvent.clientX);
      }
      if (direction === 'top' || direction === 'corner') {
        newHeight = startHeight + (startY - moveEvent.clientY);
      }

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

  const renderMessageContent = (text) => {
    const htmlText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    return htmlText.split('\n').map((line, lineIndex) => {
      const linkRegex = /\[(.*?)\]/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: line.substring(lastIndex, match.index) }} />);
        }
        const content = match[1];
        if (content.includes('|')) {
          const [name] = content.split('|');
          parts.push(
            <button
              key={`btn-${match.index}`}
              onClick={() => {
                setIsOpen(false);
                navigate('/resources');
              }}
              className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 ${theme.linkBg} ${theme.linkText} ${theme.linkHover} ${theme.linkBorder} border rounded-md transition-colors text-xs font-semibold shadow-sm`}
            >
              {name} <ExternalLink className="w-3 h-3" />
            </button>
          );
        } else {
          parts.push(<span key={`raw-${match.index}`} dangerouslySetInnerHTML={{ __html: match[0] }} />);
        }
        lastIndex = linkRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(<span key={`end-${lastIndex}`} dangerouslySetInnerHTML={{ __html: line.substring(lastIndex) }} />);
      }

      return (
        <span key={lineIndex} className={`block min-h-[1.2em] ${lineIndex > 0 && line ? "mt-0.5" : ""}`}>
          {parts.length > 0 ? parts : <span dangerouslySetInnerHTML={{ __html: line }} />}
        </span>
      );
    });
  };

  if (!user) return null;

  const currentIconOpt = ICON_OPTIONS.find((o) => o.id === selectedIcon) || ICON_OPTIONS[0];
  const ActiveIcon = currentIconOpt.Icon;
  const popupBottom = buttonSize + 16;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed right-6 z-50 rounded-3xl overflow-hidden flex flex-col bg-white"
            style={{
              bottom: `${popupBottom}px`,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              boxShadow: "0 30px 70px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.14)",
            }}
          >
            {/* Custom Invisible Drag Handles */}
            <div onMouseDown={(e) => handleMouseDown(e, 'top')} className="absolute top-0 left-0 right-0 h-1.5 cursor-row-resize z-50 hover:bg-black/10 transition-colors" />
            <div onMouseDown={(e) => handleMouseDown(e, 'left')} className="absolute top-0 bottom-0 left-0 w-1.5 cursor-col-resize z-50 hover:bg-black/10 transition-colors" />
            <div onMouseDown={(e) => handleMouseDown(e, 'corner')} className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-50 hover:bg-black/15 transition-colors rounded-tl-2xl" />

            {/* Header */}
            <div className={`relative bg-gradient-to-br ${theme.gradient} px-5 pt-5 pb-14 flex-shrink-0 overflow-hidden`}>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute top-6 -right-2 w-18 h-18 rounded-full bg-white/5" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-full bg-white/10" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 select-none">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                      <ActiveIcon size={24} className="text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow" />
                  </div>
                  <div>
                    <h3 className="text-white" style={{ fontWeight: 700, fontSize: "16px" }}>CampusBot</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="text-white/75" style={{ fontSize: "11px" }}>Online • Campus Assets AI</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 relative z-10">
                  {messages.length > 0 && (
                    <button onClick={clearChat} title="Clear Chat" className="w-8 h-8 rounded-full bg-white/15 hover:bg-red-500/80 flex items-center justify-center transition-colors">
                      <Trash2 size={14} className="text-white" />
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors">
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>
              
              {/* Stats pills */}
              <div className="flex gap-2 mt-4 relative z-10 select-none">
                {[
                  { icon: CheckCircle, label: "24 Bookings" },
                  { icon: Clock,       label: "Avg 2 min" },
                  { icon: MapPin,      label: "12 Venues" },
                  { icon: Star,        label: "4.9 Rating" },
                ].map(({ icon: Ic, label }) => (
                  <div key={label} className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-xl px-2 py-1 border border-white/10">
                    <Ic size={10} className="text-white/80" />
                    <span className="text-white/90" style={{ fontSize: "10px", fontWeight: 600 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wave divider */}
            <div className="relative flex-shrink-0 bg-slate-50" style={{ marginTop: "-2px" }}>
              <svg viewBox="0 0 370 28" className="w-full block" preserveAspectRatio="none" style={{ height: '28px' }}>
                <path d="M0,0 C90,28 280,28 370,0 L370,0 L0,0 Z" fill={`url(#wg-chat-theme)`} />
                <defs>
                  <linearGradient id={`wg-chat-theme`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={theme.svgStop1} />
                    <stop offset="100%" stopColor={theme.svgStop2} />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 pt-2 pb-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2d9f3 transparent" }}>
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                const isSystem = msg.sender === 'system';

                return (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22 }}
                    className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    {isUser ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white" style={{ fontSize: "9px", fontWeight: 700 }}>YOU</span>
                      </div>
                    ) : isSystem ? (
                      <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <AlertCircle size={13} className="text-white" />
                      </div>
                    ) : (
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Bot size={13} className="text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] px-4 py-2.5 shadow-sm ${
                      isUser 
                        ? `bg-gradient-to-br ${theme.userBubble} rounded-2xl rounded-br-sm text-white` 
                        : isSystem
                        ? "bg-red-50 border border-red-100 rounded-2xl rounded-bl-sm text-red-700"
                        : "bg-white border border-slate-100 rounded-2xl rounded-bl-sm text-slate-700"
                    }`}>
                      <div className="text-sm leading-relaxed">
                        {renderMessageContent(msg.text)}
                      </div>
                      <p className={`text-[10px] mt-1 ${isUser ? theme.textLight : isSystem ? "text-red-400" : "text-slate-400"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <div className="flex items-end gap-2 mb-4">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center flex-shrink-0 shadow`}>
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${theme.typingDot}`}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white border-t border-slate-100 px-3 py-2.5 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
              {quickActions.map(({ label, icon: Ic, color }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(label)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
                  style={{ fontWeight: 600 }}
                >
                  <Ic size={11} />
                  {label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-100 px-3 py-3 flex-shrink-0">
              <div className={`flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-4 py-2 ${theme.focusBorder} focus-within:bg-white transition-all`}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about bookings..."
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
                />
                <motion.button
                  whileTap={{ scale: 0.82 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0"
                  style={{ background: input.trim() ? theme.sendBtn : "#e2e8f0" }}
                >
                  <Send size={13} className={input.trim() ? "text-white" : "text-slate-400"} />
                </motion.button>
              </div>
              <p className="text-center text-slate-400 mt-1.5" style={{ fontSize: "10px" }}>
                Powered by Campus AI • Secure & Private
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            ref={controlsRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-64 select-none"
            style={{
              bottom: `${buttonSize + 70}px`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.15), 0 4px 16px rgba(109,40,217,0.12)",
            }}
          >
            <p className="text-slate-500 mb-2.5" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Button Icon
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {ICON_OPTIONS.map(({ id, Icon: Ic, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedIcon(id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                    selectedIcon === id ? `${theme.controlsActiveBorder} ${theme.controlsActiveBg}` : "border-transparent bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm`}>
                    <Ic size={15} className="text-white" />
                  </div>
                  <span className="text-slate-600" style={{ fontSize: "10px", fontWeight: 600 }}>{label}</span>
                </button>
              ))}
            </div>

            <p className="text-slate-500 mb-2.5" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Button Size
            </p>
            <div className="flex gap-2">
              {SIZE_PRESETS.map(({ label, size, iconSize: is }) => (
                <button
                  key={label}
                  onClick={() => { setButtonSize(size); setIconSize(is); }}
                  className={`flex-1 py-1.5 rounded-xl text-xs border-2 transition-all font-semibold ${
                    buttonSize === size ? `${theme.controlsActiveBorder} ${theme.controlsBtnActive} text-white` : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" style={{ boxShadow: "2px 2px 4px rgba(0,0,0,0.06)" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button Area */}
      <div className="fixed right-6 z-50 flex flex-col items-end gap-2" style={{ bottom: "24px" }}>
        
        {/* Settings Trigger */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setShowControls((p) => !p); }}
              className="w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:shadow-xl transition-shadow"
              title="Customize button"
            >
              <motion.div animate={{ rotate: showControls ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Settings2 size={14} className="text-slate-600" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main Floating Button */}
        <div className="relative" style={{ width: buttonSize, height: buttonSize }}>
          {!isOpen && (
            <>
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.gradient} opacity-30`}
                animate={{ scale: [1, 1.7], opacity: [0.3, 0] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.gradient} opacity-20`}
                animate={{ scale: [1, 1.4], opacity: [0.2, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setIsOpen((o) => !o); setShowControls(false); }}
            className="relative rounded-full flex items-center justify-center w-full h-full"
            style={{
              background: isOpen ? "linear-gradient(135deg,#374151,#1f2937)" : undefined,
              boxShadow: isOpen ? "0 8px 24px rgba(0,0,0,0.3)" : "0 10px 36px rgba(0,0,0,0.2)",
            }}
          >
            {!isOpen && <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.gradient}`} />}
            {!isOpen && (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-full" style={{ borderRadius: "50% 50% 0 0 / 60% 60% 0 0" }} />
              </div>
            )}
            
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <ChevronDown size={iconSize} className="text-white" />
                  </motion.div>
                ) : (
                  <motion.div key={selectedIcon} initial={{ rotate: 30, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -30, opacity: 0, scale: 0.6 }} transition={{ duration: 0.22 }}>
                    <ActiveIcon size={iconSize} className="text-white drop-shadow-sm" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {unread > 0 && !isOpen && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow"
                  style={{
                    width: Math.max(18, buttonSize * 0.28),
                    height: Math.max(18, buttonSize * 0.28),
                    fontSize: Math.max(9, buttonSize * 0.12),
                    fontWeight: 700,
                  }}
                >
                  {unread}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Intro Tooltip */}
      <AnimatePresence>
        {!isOpen && !showControls && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ delay: 2 }}
            className="fixed z-50 bg-slate-900 text-white rounded-xl px-3 py-2 shadow-xl pointer-events-none"
            style={{
              bottom: 24 + buttonSize / 2 - 16,
              right: buttonSize + 36,
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Book Campus Assets
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-2.5 h-2.5 bg-slate-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}