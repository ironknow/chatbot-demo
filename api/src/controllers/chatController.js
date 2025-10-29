import groqService from "../services/groqService.js";
import ragService from "../services/ragService.js";
import conversationService from "../services/conversationService.js";
import messageProcessingService from "../services/messageProcessingService.js";
import flowTrackingService from "../services/flowTrackingService.js";
import { CONFIG } from "../config/chatConfig.js";

export class ChatController {
  // Create a new conversation
  async createConversation(req, res) {
    try {
      const conversationData = await conversationService.createConversation();

      res.json({
        ...conversationData,
        message: CONFIG.MESSAGES.CONVERSATION_CREATED,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res
        .status(500)
        .json({ error: CONFIG.MESSAGES.FAILED_CREATE_CONVERSATION });
    }
  }

  // Main chat endpoint
  async sendMessage(req, res) {
    const { message, conversationId } = req.body;
    const userMessage = message?.trim() || "";
    const startTime = Date.now();

    // Validate input
    if (!userMessage) {
      return this.handleEmptyMessage(res, conversationId);
    }

    const flowSteps = [];
    let currentStep = null;

    try {
      // Process the message through all steps
      const result = await messageProcessingService.processMessage(
        userMessage,
        conversationId,
        flowSteps,
        startTime,
      );

      res.json(result);
    } catch (error) {
      console.error("Chat endpoint error:", error);
      messageProcessingService.handleFlowError(error, currentStep, flowSteps);

      res.status(500).json({
        reply: CONFIG.MESSAGES.TECHNICAL_ERROR,
        conversationId: conversationId || CONFIG.CONVERSATION.DEFAULT_ID,
        timestamp: new Date().toISOString(),
        flowData: {
          steps: flowSteps,
          totalDuration: Date.now() - startTime,
          error: error.message,
        },
      });
    }
  }

  // Handle empty message input
  handleEmptyMessage(res, conversationId) {
    return res.json({
      reply: CONFIG.MESSAGES.EMPTY_MESSAGE,
      conversationId: conversationId || CONFIG.CONVERSATION.DEFAULT_ID,
      timestamp: new Date().toISOString(),
      flowData: flowTrackingService.createEmptyMessageFlowData(),
    });
  }

  // Get conversation history
  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const history = await conversationService.getConversation(conversationId);
      res.json({ messages: history });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res
        .status(500)
        .json({ error: CONFIG.MESSAGES.FAILED_FETCH_CONVERSATION });
    }
  }

  // Get all conversations
  async getAllConversations(req, res) {
    try {
      const conversations = await conversationService.getAllConversations();
      res.json({ conversations });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res
        .status(500)
        .json({ error: CONFIG.MESSAGES.FAILED_FETCH_CONVERSATIONS });
    }
  }

  // Clear conversation history
  async clearConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const success =
        await conversationService.clearConversation(conversationId);
      if (success) {
        res.json({ message: CONFIG.MESSAGES.CONVERSATION_CLEARED });
      } else {
        res
          .status(500)
          .json({ error: CONFIG.MESSAGES.FAILED_CLEAR_CONVERSATION });
      }
    } catch (error) {
      console.error("Error clearing conversation:", error);
      res
        .status(500)
        .json({ error: CONFIG.MESSAGES.FAILED_CLEAR_CONVERSATION });
    }
  }

  // Test RAG search endpoint
  async testRAGSearch(req, res) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: CONFIG.MESSAGES.QUERY_REQUIRED });
      }

      const ragStatus = await ragService.getStatus();
      if (!ragStatus.available) {
        return res.status(503).json({
          error: CONFIG.MESSAGES.RAG_NOT_AVAILABLE,
          ragStatus,
        });
      }

      const searchResults = await ragService.searchDocuments(query);
      const contextualSearch = await ragService.getContextualSearch(query);

      res.json({
        query,
        searchResults,
        contextualSearch,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("RAG search test error:", error);
      res.status(500).json({
        error: CONFIG.MESSAGES.FAILED_RAG_SEARCH,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Health check
  async healthCheck(req, res) {
    try {
      const groqStatus = await groqService.getStatus();
      const conversationCount =
        await conversationService.getConversationCount();
      const storageStatus = conversationService.getStorageStatus();

      res.json({
        status: CONFIG.STATUS.HEALTHY,
        timestamp: new Date().toISOString(),
        groq: groqStatus,
        conversations: conversationCount,
        storage: storageStatus,
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        status: CONFIG.STATUS.UNHEALTHY,
        error: CONFIG.MESSAGES.DATABASE_CONNECTION_FAILED,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new ChatController();
