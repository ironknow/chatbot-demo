import React from 'react';
import { ChatHeaderProps } from '@/types';

const ChatHeader: React.FC<ChatHeaderProps> = ({
  apiStatus,
  onClear,
  onRetry,
  hasError,
}) => {
  return (
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
        {hasError && onRetry && (
          <button className="retry-btn" onClick={onRetry} title="Retry last message">
            🔄
          </button>
        )}
        <button className="clear-btn" onClick={onClear} title="Clear conversation">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
