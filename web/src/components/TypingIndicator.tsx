import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="message bot-msg typing-indicator">
      <div className="message-content">
        <span className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
