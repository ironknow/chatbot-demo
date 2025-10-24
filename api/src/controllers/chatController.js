import groqService from "../services/groqService.js";
import ragService from "../services/ragService.js";
import conversationStore from "../config/database.js";

export class ChatController {
  // Main chat endpoint
  async sendMessage(req, res) {
    const { message, conversationId } = req.body;
    const userMessage = message?.trim() || "";
    const startTime = Date.now();

    if (!userMessage) {
      return res.json({
        reply: "I didn't receive a message. Could you please try again? 😊",
        conversationId: conversationId || "default",
        timestamp: new Date().toISOString(),
        flowData: {
          steps: [
            {
              id: "backend-processing",
              name: "Backend Processing",
              description: "ChatController receives and processes request",
              status: "error",
              duration: 0,
              data: { error: "No message provided" },
              timestamp: new Date().toISOString(),
            },
          ],
          totalDuration: 0,
        },
      });
    }

    const flowSteps = [];
    let currentStep = null;

    try {
      // Step 1: Backend Processing Start
      currentStep = "backend-processing";
      const backendStartTime = Date.now();
      flowSteps.push({
        id: "backend-processing",
        name: "Backend Processing",
        description: "ChatController receives and processes request",
        status: "active",
        timestamp: new Date().toISOString(),
        data: { message: userMessage, conversationId },
      });

      // Get conversation history
      const conversationHistory = await conversationStore.get(conversationId);
      const backendDuration = Date.now() - backendStartTime;

      flowSteps[0].status = "completed";
      flowSteps[0].duration = backendDuration;
      flowSteps[0].data = {
        ...flowSteps[0].data,
        conversationHistoryLength: conversationHistory.length,
        processingTime: backendDuration,
      };

      // Step 2: AI Processing
      currentStep = "ai-processing";
      const aiStartTime = Date.now();
      flowSteps.push({
        id: "ai-processing",
        name: "AI Processing",
        description: "GroqService generates response with optional RAG",
        status: "active",
        timestamp: new Date().toISOString(),
        data: { message: userMessage },
      });

      // Get AI response with detailed tracking
      const aiResponseData = await groqService.getAIResponseWithFlowData(
        userMessage,
        conversationHistory,
      );
      const aiDuration = Date.now() - aiStartTime;

      flowSteps[1].status = "completed";
      flowSteps[1].duration = aiDuration;
      flowSteps[1].data = {
        ...flowSteps[1].data,
        response: aiResponseData.response,
        ragUsed: aiResponseData.ragUsed,
        ragContext: aiResponseData.ragContext,
        processingTime: aiDuration,
        model: aiResponseData.model,
        tokens: aiResponseData.tokens,
      };

      // Step 3: Response Return
      currentStep = "response-return";
      const responseStartTime = Date.now();
      flowSteps.push({
        id: "response-return",
        name: "Response Return",
        description: "Response sent back through API to frontend",
        status: "active",
        timestamp: new Date().toISOString(),
        data: { response: aiResponseData.response },
      });

      // Store the conversation
      const newMessages = [
        ...conversationHistory,
        {
          sender: "user",
          text: userMessage,
          timestamp: new Date().toISOString(),
        },
        {
          sender: "bot",
          text: aiResponseData.response,
          timestamp: new Date().toISOString(),
        },
      ];

      await conversationStore.set(conversationId, newMessages);
      const responseDuration = Date.now() - responseStartTime;

      flowSteps[2].status = "completed";
      flowSteps[2].duration = responseDuration;
      flowSteps[2].data = {
        ...flowSteps[2].data,
        conversationStored: true,
        processingTime: responseDuration,
      };

      const totalDuration = Date.now() - startTime;

      res.json({
        reply: aiResponseData.response,
        conversationId: conversationId || "default",
        timestamp: new Date().toISOString(),
        flowData: {
          steps: flowSteps,
          totalDuration,
          ragUsed: aiResponseData.ragUsed,
          model: aiResponseData.model,
        },
      });
    } catch (error) {
      console.error("Chat endpoint error:", error);

      // Mark current step as error
      if (currentStep && flowSteps.length > 0) {
        const errorStepIndex = flowSteps.findIndex(
          (step) => step.id === currentStep,
        );
        if (errorStepIndex >= 0) {
          flowSteps[errorStepIndex].status = "error";
          flowSteps[errorStepIndex].data = {
            ...flowSteps[errorStepIndex].data,
            error: error.message,
          };
        }
      }

      const totalDuration = Date.now() - startTime;

      res.status(500).json({
        reply:
          "I'm experiencing some technical difficulties. Please try again in a moment! 🔧",
        conversationId: conversationId || "default",
        timestamp: new Date().toISOString(),
        flowData: {
          steps: flowSteps,
          totalDuration,
          error: error.message,
        },
      });
    }
  }

  // Get conversation history
  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const history = await conversationStore.get(conversationId);
      res.json({ messages: history });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  }

  // Get all conversations
  async getAllConversations(req, res) {
    try {
      const conversations = await conversationStore.getAll();
      res.json({ conversations });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  }

  // Clear conversation history
  async clearConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const success = await conversationStore.delete(conversationId);
      if (success) {
        res.json({ message: "Conversation cleared successfully" });
      } else {
        res.status(500).json({ error: "Failed to clear conversation" });
      }
    } catch (error) {
      console.error("Error clearing conversation:", error);
      res.status(500).json({ error: "Failed to clear conversation" });
    }
  }

  // Test RAG search endpoint
  async testRAGSearch(req, res) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const ragStatus = await ragService.getStatus();
      if (!ragStatus.available) {
        return res.status(503).json({
          error: "RAG service is not available",
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
        error: "Failed to test RAG search",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Health check
  async healthCheck(req, res) {
    try {
      const groqStatus = await groqService.getStatus();
      const conversationCount = await conversationStore.size();
      const storageStatus = conversationStore.getStorageStatus();

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        groq: groqStatus,
        conversations: conversationCount,
        storage: storageStatus,
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        status: "unhealthy",
        error: "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new ChatController();
