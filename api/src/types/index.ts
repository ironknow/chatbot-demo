// Core types for the chatbot API

export interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  duration?: number;
  data?: Record<string, any>;
  timestamp: string;
}

export interface FlowData {
  steps: FlowStep[];
  totalDuration: number;
  ragUsed?: boolean;
  webSearchUsed?: boolean;
  model?: string;
  error?: string;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
  timestamp: string;
  flowData: FlowData;
}

export interface ConversationResponse {
  conversationId: string;
  title: string;
  timestamp: string;
  message: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  groq: any;
  conversations: number;
  storage: any;
}

export interface RAGSearchResponse {
  query: string;
  searchResults: any[];
  contextualSearch: any;
  timestamp: string;
}

export interface GroqResponse {
  response: string | null;
  ragUsed: boolean;
  ragContext?: any;
  webSearchUsed?: boolean;
  webSearchContext?: any;
  model: string;
  tokens?: number | null;
  processingSteps?: any[];
}

export interface ConversationStore {
  get(id: string): Promise<Message[]>;
  set(id: string, messages: Message[], title?: string): Promise<void>;
  getAll(): Promise<Conversation[]>;
  delete(id: string): Promise<boolean>;
  size(): Promise<number>;
  getStorageStatus(): any;
}

export interface GroqService {
  getAIResponse(
    message: string,
    conversationHistory: Message[],
  ): Promise<GroqResponse>;
  getAIResponseWithFlowData(
    message: string,
    conversationHistory: Message[],
  ): Promise<GroqResponse>;
  getStatus(): Promise<any>;
}

export interface RAGService {
  searchDocuments(query: string): Promise<any[]>;
  getContextualSearch(query: string): Promise<any>;
  getStatus(): Promise<any>;
}
