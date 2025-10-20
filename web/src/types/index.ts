// Message types
export interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

// API response types
export interface ChatResponse {
  reply: string;
  conversationId: string;
  timestamp: string;
}

export interface ApiHealthResponse {
  status: 'healthy' | 'error';
  timestamp: string;
  groq?: {
    configured: boolean;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  conversations?: number;
  message?: string;
}

// Component props types
export interface ChatMessageProps {
  message: Message;
  index: number;
}

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  isTyping: boolean;
  isLoading: boolean;
}

export interface ChatHeaderProps {
  apiStatus: ApiHealthResponse | null;
  onClear: () => void;
  onRetry?: () => void;
  hasError: boolean;
}

// Hook types
export interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  conversationId: string;
  sendMessage: () => void;
  clearConversation: () => void;
  retryLastMessage: () => void;
  apiStatus: ApiHealthResponse | null;
}

// Service types
export interface ChatService {
  sendMessage: (message: string, conversationId: string) => Promise<ChatResponse>;
  getConversation: (conversationId: string) => Promise<{ messages: Message[] }>;
  clearConversation: (conversationId: string) => Promise<{ message: string }>;
  checkHealth: () => Promise<ApiHealthResponse>;
}

// Error types
export interface ChatError {
  message: string;
  code?: string;
  status?: number;
}
