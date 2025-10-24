import fetch from "node-fetch";
import { groqConfig, systemPrompt } from "../config/groq.js";
import ragService from "./ragService.js";

export class GroqService {
  constructor() {
    this.apiKey = groqConfig.apiKey;
    this.model = groqConfig.model;
    this.maxTokens = groqConfig.maxTokens;
    this.temperature = groqConfig.temperature;
    this.baseURL = groqConfig.baseURL;
  }

  // Format conversation history for Groq API
  formatConversationForAI(conversationHistory) {
    return conversationHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));
  }

  // Get AI response from Groq with RAG enhancement
  async getAIResponse(userMessage, conversationHistory = []) {
    try {
      // Check if API key is configured
      if (!this.apiKey) {
        return "🤖 I'm not properly configured yet. Please set up the Groq API key to enable AI responses!";
      }

      // Try to get RAG-enhanced context first
      let ragContext = null;
      let ragResponse = null;

      try {
        // Check if RAG service is available
        const ragAvailable = await ragService.isAvailable();

        if (ragAvailable) {
          console.log("RAG service available, enhancing response...");

          // Get contextual search results for RAG enhancement
          ragContext = await ragService.getContextualSearch(userMessage);
        } else {
          console.log(
            "RAG service not available, using standard Groq response",
          );
        }
      } catch (ragError) {
        console.warn(
          "RAG integration failed, falling back to standard response:",
          ragError.message,
        );
      }

      // Build enhanced system prompt with RAG context
      let enhancedSystemPrompt = systemPrompt;

      if (ragContext) {
        enhancedSystemPrompt += `\n\nIMPORTANT: Use the following context from your knowledge base to provide accurate, detailed answers. If the context doesn't contain relevant information, say so clearly.\n\nCONTEXT:\n${ragContext.context}\n\nPlease provide a helpful response based on this context and the user's question.`;
      }

      // Format the conversation history
      const messages = [
        { role: "system", content: enhancedSystemPrompt },
        ...this.formatConversationForAI(conversationHistory),
        { role: "user", content: userMessage },
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);

        if (response.status === 401) {
          return "I'm having trouble with my API configuration. Please check the Groq API key! 🔧";
        } else if (response.status === 429) {
          return "I'm getting too many requests right now. Please wait a moment and try again! ⏳";
        } else {
          return "I'm experiencing some technical difficulties. Please try again in a moment! 🤖";
        }
      }

      const data = await response.json();
      console.log("Groq API Response:", data); // Debug log

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected response structure:", data);
        return "I received an unexpected response. Please try again! 🤔";
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Groq API Error:", error);
      return "I'm having trouble connecting to the AI service. Please try again in a moment! 🔧";
    }
  }

  // Get AI response with detailed flow tracking data
  async getAIResponseWithFlowData(userMessage, conversationHistory = []) {
    const startTime = Date.now();
    const flowData = {
      response: null,
      ragUsed: false,
      ragContext: null,
      model: this.model,
      tokens: null,
      processingSteps: [],
    };

    try {
      // Check if API key is configured
      if (!this.apiKey) {
        flowData.response =
          "🤖 I'm not properly configured yet. Please set up the Groq API key to enable AI responses!";
        return flowData;
      }

      // Step 1: RAG Processing
      const ragStartTime = Date.now();
      flowData.processingSteps.push({
        id: "rag-processing",
        name: "RAG Processing",
        description: "Checking RAG service availability and context retrieval",
        status: "active",
        timestamp: new Date().toISOString(),
      });

      let ragContext = null;
      let ragResponse = null;

      try {
        // Check if RAG service is available
        const ragAvailable = await ragService.isAvailable();

        if (ragAvailable) {
          console.log("RAG service available, enhancing response...");

          // Get contextual search results for RAG enhancement
          ragContext = await ragService.getContextualSearch(userMessage);

          flowData.ragUsed = true;
          flowData.ragContext = ragContext;
        } else {
          console.log(
            "RAG service not available, using standard Groq response",
          );
        }
      } catch (ragError) {
        console.warn(
          "RAG integration failed, falling back to standard response:",
          ragError.message,
        );
        flowData.processingSteps[0].status = "error";
        flowData.processingSteps[0].data = { error: ragError.message };
      }

      const ragDuration = Date.now() - ragStartTime;
      flowData.processingSteps[0].status =
        flowData.processingSteps[0].status === "error" ? "error" : "completed";
      flowData.processingSteps[0].duration = ragDuration;
      flowData.processingSteps[0].data = {
        ...flowData.processingSteps[0].data,
        ragAvailable: !!ragContext || !!ragResponse,
        ragUsed: flowData.ragUsed,
        processingTime: ragDuration,
      };

      // If we got a direct RAG response, use it
      if (ragResponse) {
        flowData.response = ragResponse;
        return flowData;
      }

      // Step 2: Groq API Processing
      const groqStartTime = Date.now();
      flowData.processingSteps.push({
        id: "groq-processing",
        name: "Groq API Processing",
        description: "Sending request to Groq API and processing response",
        status: "active",
        timestamp: new Date().toISOString(),
      });

      // Build enhanced system prompt with RAG context
      let enhancedSystemPrompt = systemPrompt;

      if (ragContext) {
        enhancedSystemPrompt += `\n\nIMPORTANT: Use the following context from your knowledge base to provide accurate, detailed answers. If the context doesn't contain relevant information, say so clearly.\n\nCONTEXT:\n${ragContext.context}\n\nPlease provide a helpful response based on this context and the user's question.`;
      }

      // Format the conversation history
      const messages = [
        { role: "system", content: enhancedSystemPrompt },
        ...this.formatConversationForAI(conversationHistory),
        { role: "user", content: userMessage },
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        }),
      });

      const groqDuration = Date.now() - groqStartTime;

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);

        flowData.processingSteps[1].status = "error";
        flowData.processingSteps[1].duration = groqDuration;
        flowData.processingSteps[1].data = {
          error: errorData,
          status: response.status,
        };

        if (response.status === 401) {
          flowData.response =
            "I'm having trouble with my API configuration. Please check the Groq API key! 🔧";
        } else if (response.status === 429) {
          flowData.response =
            "I'm getting too many requests right now. Please wait a moment and try again! ⏳";
        } else {
          flowData.response =
            "I'm experiencing some technical difficulties. Please try again in a moment! 🤖";
        }
        return flowData;
      }

      const data = await response.json();
      console.log("Groq API Response:", data); // Debug log

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected response structure:", data);
        flowData.processingSteps[1].status = "error";
        flowData.processingSteps[1].duration = groqDuration;
        flowData.processingSteps[1].data = {
          error: "Unexpected response structure",
          data,
        };
        flowData.response =
          "I received an unexpected response. Please try again! 🤔";
        return flowData;
      }

      flowData.response = data.choices[0].message.content.trim();
      flowData.tokens = data.usage?.total_tokens || null;
      flowData.processingSteps[1].status = "completed";
      flowData.processingSteps[1].duration = groqDuration;
      flowData.processingSteps[1].data = {
        model: this.model,
        tokens: flowData.tokens,
        processingTime: groqDuration,
        responseLength: flowData.response.length,
      };

      return flowData;
    } catch (error) {
      console.error("Groq API Error:", error);
      flowData.response =
        "I'm having trouble connecting to the AI service. Please try again in a moment! 🔧";

      // Mark the last step as error if it exists
      if (flowData.processingSteps.length > 0) {
        const lastStep =
          flowData.processingSteps[flowData.processingSteps.length - 1];
        if (lastStep.status === "active") {
          lastStep.status = "error";
          lastStep.data = { ...lastStep.data, error: error.message };
        }
      }

      return flowData;
    }
  }

  // Check if service is properly configured
  isConfigured() {
    return !!this.apiKey;
  }

  // Get service status
  async getStatus() {
    try {
      const ragStatus = await ragService.getStatus();

      return {
        configured: this.isConfigured(),
        model: this.model,
        maxTokens: this.maxTokens,
        temperature: this.temperature,
        rag: ragStatus,
      };
    } catch (error) {
      return {
        configured: this.isConfigured(),
        model: this.model,
        maxTokens: this.maxTokens,
        temperature: this.temperature,
        rag: { available: false, error: error.message },
      };
    }
  }
}

export default new GroqService();
