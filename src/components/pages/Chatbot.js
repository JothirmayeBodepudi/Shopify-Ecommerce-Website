import React, { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, Loader2 } from "lucide-react";
import "./Chatbot.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";

export default function Chatbot({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your ShopEase assistant. How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Sorry, I'm offline. Check your connection!", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-window animate-slideUp">
      <div className="chatbot-header">
        <div className="header-info">
          <Bot size={20} />
          <span>ShopEase AI</span>
        </div>
        <button onClick={() => setIsOpen(false)}><X size={20} /></button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-bubble ${msg.sender}`}>
            <div className="avatar-icon">
              {msg.sender === "bot" ? <Bot size={14} /> : <User size={14} />}
            </div>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble bot">
            <Loader2 size={16} className="animate-spin" />
            <p>Thinking...</p>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="chatbot-input">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={isLoading}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}