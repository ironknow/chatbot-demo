import React from 'react';

const WelcomeMessage: React.FC = () => {
  return (
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
  );
};

export default WelcomeMessage;
