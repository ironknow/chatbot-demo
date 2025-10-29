// Configuration constants for ChatController
export const CONFIG = {
  MESSAGES: {
    EMPTY_MESSAGE: "I didn't receive a message. Could you please try again? 😊",
    TECHNICAL_ERROR:
      "I'm experiencing some technical difficulties. Please try again in a moment! 🔧",
    CONVERSATION_CREATED: "Conversation created successfully",
    CONVERSATION_CLEARED: "Conversation cleared successfully",
    FAILED_CREATE_CONVERSATION: "Failed to create conversation",
    FAILED_FETCH_CONVERSATION: "Failed to fetch conversation",
    FAILED_FETCH_CONVERSATIONS: "Failed to fetch conversations",
    FAILED_CLEAR_CONVERSATION: "Failed to clear conversation",
    FAILED_RAG_SEARCH: "Failed to test RAG search",
    RAG_NOT_AVAILABLE: "RAG service is not available",
    QUERY_REQUIRED: "Query parameter is required",
    DATABASE_CONNECTION_FAILED: "Database connection failed",
  },
  FLOW_STEPS: {
    BACKEND_PROCESSING: {
      ID: "backend-processing",
      NAME: "Backend Processing",
      DESCRIPTION: "ChatController receives and processes request",
    },
    AI_PROCESSING: {
      ID: "ai-processing",
      NAME: "AI Processing",
      DESCRIPTION: "GroqService generates response with optional RAG",
    },
    RESPONSE_RETURN: {
      ID: "response-return",
      NAME: "Response Return",
      DESCRIPTION: "Response sent back through API to frontend",
    },
  },
  STATUS: {
    HEALTHY: "healthy",
    UNHEALTHY: "unhealthy",
    ACTIVE: "active",
    COMPLETED: "completed",
    ERROR: "error",
  },
  SENDERS: {
    USER: "user",
    BOT: "bot",
  },
  ERRORS: {
    NO_MESSAGE_PROVIDED: "No message provided",
  },
  CONVERSATION: {
    DEFAULT_ID: "default",
    DEFAULT_TITLE: "New Conversation",
    MAX_TITLE_LENGTH: 50,
  },
  TITLE_PROMPTS: [
    "Generate a creative, engaging title for a new conversation. Keep it short (2-4 words) and welcoming. Examples: 'Let's Chat', 'New Adventure', 'Fresh Start', 'Hello There'. Just return the title, nothing else.",
    "Create a friendly conversation title. Make it inviting and concise (2-4 words). Examples: 'Chat Time', 'New Journey', 'Let's Talk', 'Hello Friend'. Only return the title.",
    "Generate a warm, welcoming title for starting a new chat. Keep it brief (2-4 words) and positive. Examples: 'New Chat', 'Let's Connect', 'Hello World', 'Fresh Chat'. Just the title please.",
  ],
  FALLBACK_TITLES: [
    "Let's Chat",
    "New Adventure",
    "Fresh Start",
    "Hello There",
    "Chat Time",
    "New Journey",
    "Let's Talk",
    "Hello Friend",
    "New Chat",
    "Let's Connect",
  ],
} as const;
