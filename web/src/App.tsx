import React, { useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { 
  ChatHeader, 
  ChatMessage, 
  ChatInput, 
  WelcomeMessage, 
  TypingIndicator 
} from '@/components';
import './App.css';

const App: React.FC = () => {
  const {
    messages,
    input,
    setInput,
    isTyping,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
    apiStatus,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className="chat-container">
      <ChatHeader
        apiStatus={apiStatus}
        onClear={clearConversation}
        onRetry={error ? retryLastMessage : undefined}
        hasError={!!error}
      />

      <div className="chat-box">
        {messages.length === 0 && <WelcomeMessage />}

        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} index={index} />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        onSend={sendMessage}
        disabled={isTyping}
        isTyping={isTyping}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
