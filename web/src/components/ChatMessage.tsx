import React from 'react';
import { ChatMessageProps } from '@/types';

const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`message ${message.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
      <div className="message-content">
        {message.text}
      </div>
      <div className="message-time">
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
};

export default ChatMessage;
