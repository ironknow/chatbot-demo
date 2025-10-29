import conversationStore from "../config/database.js";
import groqService from "../services/groqService.js";
import { CONFIG } from "../config/chatConfig.js";
import type { Message, ConversationResponse } from "../types/index.js";

export class ConversationService {
  // Generate a hashed conversation ID
  generateConversationId(): string {
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
  async generateConversationTitle(): Promise<string> {
    try {
      const randomPrompt =
        CONFIG.TITLE_PROMPTS[
          Math.floor(Math.random() * CONFIG.TITLE_PROMPTS.length)
        ];

      const response = await groqService.getAIResponse(randomPrompt || "", []);
      return (
        (response || "").trim().replace(/['"]/g, "") ||
        CONFIG.FALLBACK_TITLES[0]
      );
    } catch (error) {
      console.warn(
        "Failed to generate title with Groq, using fallback:",
        (error as Error).message,
      );
      // Fallback titles
      return (
        CONFIG.FALLBACK_TITLES[
          Math.floor(Math.random() * CONFIG.FALLBACK_TITLES.length)
        ] || CONFIG.FALLBACK_TITLES[0]
      );
    }
  }

  // Create a new conversation
  async createConversation(): Promise<ConversationResponse> {
    const conversationId = this.generateConversationId();
    const title = await this.generateConversationTitle();

    // Initialize empty conversation with the generated title
    await conversationStore.set(conversationId, [], title);

    return {
      conversationId,
      title: title || CONFIG.FALLBACK_TITLES[0],
      timestamp: new Date().toISOString(),
      message: CONFIG.MESSAGES.CONVERSATION_CREATED,
    };
  }

  // Get conversation history
  async getConversation(conversationId: string): Promise<Message[]> {
    return await conversationStore.get(conversationId);
  }

  // Get all conversations
  async getAllConversations(): Promise<any[]> {
    return await conversationStore.getAll();
  }

  // Clear conversation history
  async clearConversation(conversationId: string): Promise<boolean> {
    return await conversationStore.delete(conversationId);
  }

  // Build conversation messages array
  buildConversationMessages(
    conversationHistory: Message[],
    userMessage: string,
    botResponse: string,
  ): Message[] {
    return [
      ...conversationHistory,
      {
        sender: CONFIG.SENDERS.USER as "user" | "bot",
        text: userMessage,
        timestamp: new Date().toISOString(),
      },
      {
        sender: CONFIG.SENDERS.BOT as "user" | "bot",
        text: botResponse,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  // Store conversation with new messages
  async storeConversation(
    conversationId: string,
    conversationHistory: Message[],
    userMessage: string,
    botResponse: string,
  ): Promise<Message[]> {
    const newMessages = this.buildConversationMessages(
      conversationHistory,
      userMessage,
      botResponse,
    );
    await conversationStore.set(conversationId, newMessages);
    return newMessages;
  }

  // Get conversation count
  async getConversationCount(): Promise<number> {
    return await conversationStore.size();
  }

  // Get storage status
  getStorageStatus(): any {
    return conversationStore.getStorageStatus();
  }
}

export default new ConversationService();
