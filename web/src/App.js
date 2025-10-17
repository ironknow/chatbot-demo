import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(() => 
    `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/health");
      setApiStatus(response.data);
    } catch (err) {
      setApiStatus({ status: 'error', message: 'API not reachable' });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping || isLoading) return;
    
    const userMsg = { 
      sender: "user", 
      text: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", { 
        message: input.trim(),
        conversationId 
      });
      
      // Simulate typing delay for more realistic feel
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: res.data.reply,
          timestamp: res.data.timestamp || new Date().toISOString()
        }]);
        setIsTyping(false);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // 1-2 second delay
      
    } catch (err) {
      console.error('Chat error:', err);
      setTimeout(() => {
        const errorMsg = err.response?.data?.reply || 
          "⚠️ Sorry, I'm having trouble connecting. Please try again in a moment.";
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: errorMsg,
          timestamp: new Date().toISOString()
        }]);
        setIsTyping(false);
        setIsLoading(false);
        setError(errorMsg);
      }, 1000);
    }
  };

  const clearConversation = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/chat/${conversationId}`);
      setMessages([]);
      setError(null);
      setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    } catch (err) {
      console.error("Failed to clear conversation:", err);
      setError("Failed to clear conversation. Please try again.");
    }
  };

  const retryLastMessage = () => {
    if (messages.length > 0 && error) {
      const lastUserMessage = messages
        .filter(msg => msg.sender === 'user')
        .pop();
      if (lastUserMessage) {
        setInput(lastUserMessage.text);
        setError(null);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <h2>Chatty 🤖</h2>
          {apiStatus && (
            <div className={`status-indicator ${apiStatus.status === 'healthy' ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              {apiStatus.status === 'healthy' ? 'Online' : 'Offline'}
            </div>
          )}
        </div>
        <div className="header-actions">
          {error && (
            <button className="retry-btn" onClick={retryLastMessage} title="Retry last message">
              🔄
            </button>
          )}
          <button className="clear-btn" onClick={clearConversation} title="Clear conversation">
            🗑️
          </button>
        </div>
      </div>
      
      <div className="chat-box">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Welcome! I'm Chatty, your friendly AI assistant.</p>
            <p>Try asking me about:</p>
            <ul>
              <li>What's your name?</li>
              <li>What can you help me with?</li>
              <li>What time is it?</li>
              <li>How are you today?</li>
            </ul>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
            <div className="message-content">
              {msg.text}
            </div>
            <div className="message-time">
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot-msg typing-indicator">
            <div className="message-content">
              <span className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && !isTyping && sendMessage()}
          disabled={isTyping}
        />
        <button 
          onClick={sendMessage} 
          disabled={!input.trim() || isTyping || isLoading}
          className={isTyping || isLoading ? "disabled" : ""}
        >
          {isTyping ? "..." : isLoading ? "⏳" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
