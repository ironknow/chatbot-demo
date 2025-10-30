import { Request, Response } from "express";
import groqService from "../services/groqService.js";
import ragService from "../services/ragService.js";
import conversationService from "../services/conversationService.js";
import messageProcessingService from "../services/messageProcessingService.js";
import flowTrackingService from "../services/flowTrackingService.js";
import { CONFIG } from "../config/chatConfig.js";
import type { FlowStep } from "../types/index.js";

export class ChatController {
  // Create a new conversation
  async createConversation(req: Request, res: Response): Promise<void> {
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
  async sendMessage(req: Request, res: Response): Promise<void> {
    const { message, conversationId } = req.body;
    const userMessage = message?.trim() || "";
    const startTime = Date.now();

    // Validate input
    if (!userMessage) {
      this.handleEmptyMessage(res, conversationId || "");
      return;
    }

    const flowSteps: FlowStep[] = [];
    const currentStep: string | null = null;

    try {
      // Process the message through all steps
      const result = await messageProcessingService.processMessage(
        userMessage,
        conversationId || "",
        flowSteps,
        startTime,
      );

      res.json(result);
    } catch (error) {
      console.error("Chat endpoint error:", error);
      messageProcessingService.handleFlowError(
        error as Error,
        currentStep,
        flowSteps,
      );

      res.status(500).json({
        reply: CONFIG.MESSAGES.TECHNICAL_ERROR,
        conversationId: conversationId || CONFIG.CONVERSATION.DEFAULT_ID,
        timestamp: new Date().toISOString(),
        flowData: {
          steps: flowSteps,
          totalDuration: Date.now() - startTime,
          error: (error as Error).message,
        },
      });
    }
  }

  // Main chat endpoint with SSE streaming
  async sendMessageStream(req: Request, res: Response): Promise<void> {
    const { message, conversationId } = req.body;
    const userMessage = message?.trim() || "";
    const startTime = Date.now();

    // Validate input
    if (!userMessage) {
      res.status(400).json({ error: "Message cannot be empty" });
      return;
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    const sendEvent = (event: string, data: any) => {
      try {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (err) {
        console.error("Error sending SSE event:", err);
      }
    };

    const flowSteps: FlowStep[] = [];

    try {
      // Step 1: Backend Processing
      sendEvent("step", {
        id: "backend-processing",
        name: "Backend Processing",
        description: "Loading conversation history",
        status: "active",
        timestamp: new Date().toISOString(),
      });

      const conversationHistory =
        await messageProcessingService.processBackendStep(
          userMessage,
          conversationId || "",
          flowSteps,
        );

      sendEvent("step", {
        id: "backend-processing",
        status: "completed",
        timestamp: new Date().toISOString(),
      });

      // Step 2: AI Processing with sub-steps
      sendEvent("step", {
        id: "ai-processing",
        name: "AI Processing",
        description: "Preparing AI response",
        status: "active",
        timestamp: new Date().toISOString(),
      });

      // Get AI response with step-by-step progress
      const aiResponseData = await this.processAIWithProgress(
        userMessage,
        conversationHistory,
        sendEvent,
      );

      sendEvent("step", {
        id: "ai-processing",
        status: "completed",
        timestamp: new Date().toISOString(),
      });

      // Step 3: Response Processing
      sendEvent("step", {
        id: "response-processing",
        name: "Response Processing",
        description: "Saving conversation",
        status: "active",
        timestamp: new Date().toISOString(),
      });

      await messageProcessingService.processResponseStep(
        userMessage,
        conversationId || "",
        conversationHistory,
        aiResponseData,
        flowSteps,
      );

      sendEvent("step", {
        id: "response-processing",
        status: "completed",
        timestamp: new Date().toISOString(),
      });

      // Send final response
      const totalDuration = Date.now() - startTime;
      sendEvent("complete", {
        reply: aiResponseData.response || "",
        conversationId: conversationId || CONFIG.CONVERSATION.DEFAULT_ID,
        timestamp: new Date().toISOString(),
        flowData: flowTrackingService.createFlowDataResponse(
          flowSteps,
          totalDuration,
          {
            ragUsed: aiResponseData.ragUsed,
            webSearchUsed: aiResponseData.webSearchUsed,
            model: aiResponseData.model,
          },
        ),
      });

      res.end();
    } catch (error) {
      console.error("Chat stream endpoint error:", error);
      sendEvent("error", {
        error: (error as Error).message,
        reply: CONFIG.MESSAGES.TECHNICAL_ERROR,
        conversationId: conversationId || CONFIG.CONVERSATION.DEFAULT_ID,
        timestamp: new Date().toISOString(),
      });
      res.end();
    }
  }

  // Helper method to process AI with progress updates
  private async processAIWithProgress(
    userMessage: string,
    conversationHistory: any[],
    sendEvent: (event: string, data: any) => void,
  ): Promise<any> {
    // RAG Processing
    sendEvent("step", {
      id: "rag-processing",
      name: "RAG Processing",
      description: "Searching knowledge base",
      status: "active",
      timestamp: new Date().toISOString(),
    });

    let ragContext: any = null;
    try {
      const ragService = (await import("../services/ragService.js")).default;
      const ragAvailable = await ragService.isAvailable();
      if (ragAvailable) {
        ragContext = await ragService.getContextualSearch(userMessage);
      }
    } catch (error) {
      console.warn("RAG processing error:", error);
    }

    sendEvent("step", {
      id: "rag-processing",
      status: ragContext ? "completed" : "skipped",
      timestamp: new Date().toISOString(),
      data: { ragUsed: !!ragContext },
    });

    // Web Search Processing
    sendEvent("step", {
      id: "web-search-processing",
      name: "Web Search",
      description: "Searching the web for current information",
      status: "active",
      timestamp: new Date().toISOString(),
    });

    let webSearchContext: any = null;
    try {
      const webSearchService = (await import("../services/webSearchService.js"))
        .default;
      if (webSearchService.shouldSearch(userMessage)) {
        webSearchContext =
          await webSearchService.getContextualWebSearch(userMessage);
      }
    } catch (error) {
      console.warn("Web search error:", error);
    }

    sendEvent("step", {
      id: "web-search-processing",
      status: webSearchContext ? "completed" : "skipped",
      timestamp: new Date().toISOString(),
      data: { webSearchUsed: !!webSearchContext },
    });

    // Thinking/Generating
    sendEvent("step", {
      id: "thinking",
      name: "Thinking",
      description: "Analyzing query and generating response",
      status: "active",
      timestamp: new Date().toISOString(),
    });

    // Get AI response (pass contexts to avoid duplication)
    const groqService = (await import("../services/groqService.js")).default;
    const aiResponseData = await groqService.getAIResponseWithFlowData(
      userMessage,
      conversationHistory,
      ragContext, // Pass the RAG context we already fetched
      webSearchContext, // Pass the web search context we already fetched
    );

    sendEvent("step", {
      id: "thinking",
      status: "completed",
      timestamp: new Date().toISOString(),
      data: { model: aiResponseData.model, tokens: aiResponseData.tokens },
    });

    // Contexts are already set in groqService response
    return aiResponseData;
  }

  // Handle empty message input
  private handleEmptyMessage(res: Response, conversationId: string): void {
    res.json({
      reply: CONFIG.MESSAGES.EMPTY_MESSAGE,
      conversationId: conversationId || CONFIG.CONVERSATION.DEFAULT_ID,
      timestamp: new Date().toISOString(),
      flowData: flowTrackingService.createEmptyMessageFlowData(),
    });
  }

  // Get conversation history
  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      if (!conversationId) {
        res.status(400).json({ error: "Conversation ID is required" });
        return;
      }
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
  async getAllConversations(req: Request, res: Response): Promise<void> {
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
  async clearConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      if (!conversationId) {
        res.status(400).json({ error: "Conversation ID is required" });
        return;
      }
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
  async testRAGSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      if (!query) {
        res.status(400).json({ error: CONFIG.MESSAGES.QUERY_REQUIRED });
        return;
      }

      const ragStatus = await ragService.getStatus();
      if (!ragStatus.available) {
        res.status(503).json({
          error: CONFIG.MESSAGES.RAG_NOT_AVAILABLE,
          ragStatus,
        });
        return;
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
        message: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Health check
  async healthCheck(req: Request, res: Response): Promise<void> {
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
