import conversationStore from "../config/database.js";
import groqService from "../services/groqService.js";
import { CONFIG } from "../config/chatConfig.js";

export class ConversationService {
  // Generate a hashed conversation ID
  generateConversationId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    const combined = timestamp + random;
    const hashed = Buffer.from(combined)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
    return `conv_${hashed}`;
  }

  // Generate a conversation title using Groq
  async generateConversationTitle() {
    try {
      const randomPrompt =
        CONFIG.TITLE_PROMPTS[
          Math.floor(Math.random() * CONFIG.TITLE_PROMPTS.length)
        ];

      const response = await groqService.getAIResponse(randomPrompt, "");
      return response.reply.trim().replace(/['"]/g, ""); // Remove quotes if any
    } catch (error) {
      console.warn(
        "Failed to generate title with Groq, using fallback:",
        error.message,
      );
      // Fallback titles
      return CONFIG.FALLBACK_TITLES[
        Math.floor(Math.random() * CONFIG.FALLBACK_TITLES.length)
      ];
    }
  }

  // Create a new conversation
  async createConversation() {
    const conversationId = this.generateConversationId();
    const title = await this.generateConversationTitle();

    // Initialize empty conversation with the generated title
    await conversationStore.set(conversationId, [], title);

    return {
      conversationId,
      title,
      timestamp: new Date().toISOString(),
    };
  }

  // Get conversation history
  async getConversation(conversationId) {
    return await conversationStore.get(conversationId);
  }

  // Get all conversations
  async getAllConversations() {
    return await conversationStore.getAll();
  }

  // Clear conversation history
  async clearConversation(conversationId) {
    return await conversationStore.delete(conversationId);
  }

  // Build conversation messages array
  buildConversationMessages(conversationHistory, userMessage, botResponse) {
    return [
      ...conversationHistory,
      {
        sender: CONFIG.SENDERS.USER,
        text: userMessage,
        timestamp: new Date().toISOString(),
      },
      {
        sender: CONFIG.SENDERS.BOT,
        text: botResponse,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  // Store conversation with new messages
  async storeConversation(
    conversationId,
    conversationHistory,
    userMessage,
    botResponse,
  ) {
    const newMessages = this.buildConversationMessages(
      conversationHistory,
      userMessage,
      botResponse,
    );
    await conversationStore.set(conversationId, newMessages);
    return newMessages;
  }

  // Get conversation count
  async getConversationCount() {
    return await conversationStore.size();
  }

  // Get storage status
  getStorageStatus() {
    return conversationStore.getStorageStatus();
  }
}

export default new ConversationService();
