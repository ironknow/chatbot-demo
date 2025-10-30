// File attachment types
export interface FileAttachment {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "document" | "other";
}

// Message types
export interface Message {
  id?: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  attachments?: FileAttachment[];
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

// API response types
export interface ChatResponse {
  reply: string;
  conversationId: string;
  timestamp: string;
  flowData?: FlowData;
}

export interface FlowData {
  steps: FlowStep[];
  totalDuration: number;
  ragUsed?: boolean;
  model?: string;
  error?: string;
}

export interface FlowStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  duration?: number;
  data?: any;
  timestamp?: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface ApiHealthResponse {
  status: "healthy" | "error";
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
  files?: FileAttachment[];
  onFilesChange?: (files: FileAttachment[]) => void;
}

export interface ChatHeaderProps {
  apiStatus: ApiHealthResponse | null;
  onClear: () => void;
  onRetry?: () => void;
  hasError: boolean;
  onToggleFlow?: () => void;
  showFlow?: boolean;
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
  conversations: Conversation[];
  currentConversation: Conversation | null;
  sendMessage: () => void;
  clearConversation: () => void;
  retryLastMessage: () => void;
  loadConversations: () => Promise<void>;
  switchConversation: (conversationId: string) => Promise<void>;
  createNewConversation: () => void;
  apiStatus: ApiHealthResponse | null;
  // Flow tracking data
  flowData: FlowData | null;
  currentStep: string | null;
  flowSteps: FlowStep[];
  isFlowProcessing: boolean;
  clearFlow: () => void;
  // Processing steps for real-time UI
  processingSteps: Array<{
    id: string;
    name: string;
    description: string;
    status: "pending" | "active" | "completed" | "error" | "skipped";
    timestamp?: string;
    data?: any;
  }>;
  // File attachments
  files: FileAttachment[];
  setFiles: (files: FileAttachment[]) => void;
  // Conversations loading state
  conversationsLoading: boolean;
}

// Service types
export interface ChatService {
  sendMessage: (
    message: string,
    conversationId: string,
  ) => Promise<ChatResponse>;
  getConversation: (conversationId: string) => Promise<{ messages: Message[] }>;
  getAllConversations: () => Promise<ConversationsResponse>;
  clearConversation: (conversationId: string) => Promise<{ message: string }>;
  checkHealth: () => Promise<ApiHealthResponse>;
}

// Error types
export interface ChatError {
  message: string;
  code?: string;
  status?: number;
}

// Flow types
export * from "./flow";
