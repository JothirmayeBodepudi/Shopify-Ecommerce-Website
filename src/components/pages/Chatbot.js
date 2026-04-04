import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User } from "lucide-react";
import "../styles/Chatbot.css";

export default function Chatbot({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm your ShopEase assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Visual feedback for the user
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add user message to UI
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const query = input; // Capture input before clearing
    setInput("");
    setIsTyping(true);

    try {
      // 2. Send to your Backend API
      const response = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            message: query,
            userId: localStorage.getItem("userId") || "GUEST" 
        }),
      });

      const data = await response.json();

      // 3. Add Bot response to UI
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-fixed-container">
      <div className="chat-window">
        {/* HEADER */}
        <div className="chat-header">
          <div className="header-info">
            <Bot size={20} />
            <span>ShopEase Assistant</span>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* MESSAGE BODY */}
        <div className="chat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-bubble-wrapper ${msg.role}`}>
              <div className="avatar-circle">
                {msg.role === "bot" ? <Bot size={12} /> : <User size={12} />}
              </div>
              <div className="msg-text">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="msg-bubble-wrapper bot">
              <div className="avatar-circle"><Bot size={12} /></div>
              <div className="msg-text typing">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT FOOTER */}
        <form className="chat-footer" onSubmit={handleSendMessage}>
          <input 
            type="text"
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" disabled={!input.trim() || isTyping}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}