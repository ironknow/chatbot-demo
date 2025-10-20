import React from 'react';
import { ChatInputProps } from '@/types';

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  disabled,
  isTyping,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      onSend();
    }
  };

  return (
    <div className="input-area">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        onClick={onSend}
        disabled={!input.trim() || disabled}
        className={isTyping || isLoading ? 'disabled' : ''}
      >
        {isTyping ? '...' : isLoading ? '⏳' : 'Send'}
      </button>
    </div>
  );
};

export default ChatInput;
