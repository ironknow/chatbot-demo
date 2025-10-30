import fetch from "node-fetch";
import { groqConfig, systemPrompt } from "../config/groq.js";
import ragService from "./ragService.js";
import webSearchService from "./webSearchService.js";
import type { Message, GroqResponse } from "../types/index.js";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqAPIResponse {
  choices?: Array<{
    message?: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens?: number;
  };
}

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: string;
  timestamp: string;
  duration?: number;
  data?: Record<string, any>;
}

export class GroqService {
  private apiKey: string | undefined;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private baseURL: string;

  constructor() {
    this.apiKey = groqConfig.apiKey;
    this.model = groqConfig.model;
    this.maxTokens = groqConfig.maxTokens;
    this.temperature = groqConfig.temperature;
    this.baseURL = groqConfig.baseURL;
  }

  // Format conversation history for Groq API
  formatConversationForAI(conversationHistory: Message[]): GroqMessage[] {
    return conversationHistory.map((msg) => ({
      role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.text,
    }));
  }

  // Get AI response from Groq with RAG and web search enhancement
  async getAIResponse(
    userMessage: string,
    conversationHistory: Message[] = [],
  ): Promise<string> {
    try {
      // Check if API key is configured
      if (!this.apiKey) {
        return "🤖 I'm not properly configured yet. Please set up the Groq API key to enable AI responses!";
      }

      // Try to get RAG-enhanced context first
      let ragContext: { context: string; sources: any[] } | null = null;

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
          (ragError as Error).message,
        );
      }

      // Try to get web search context
      let webSearchContext: { context: string; results: any[] } | null = null;

      try {
        if (webSearchService.shouldSearch(userMessage)) {
          console.log("Web search triggered, enhancing response...");
          webSearchContext =
            await webSearchService.getContextualWebSearch(userMessage);
        }
      } catch (webSearchError) {
        console.warn(
          "Web search failed, continuing without web context:",
          (webSearchError as Error).message,
        );
      }

      // Build enhanced system prompt with RAG and web search context
      let enhancedSystemPrompt = systemPrompt;

      if (ragContext) {
        enhancedSystemPrompt += `\n\nIMPORTANT: Use the following context from your knowledge base to provide accurate, detailed answers. If the context doesn't contain relevant information, say so clearly.\n\nKNOWLEDGE BASE CONTEXT:\n${ragContext.context}\n\n`;
      }

      if (webSearchContext) {
        enhancedSystemPrompt += `\n\nCURRENT WEB INFORMATION: The following information was retrieved from web sources to provide up-to-date information. Use this to supplement your knowledge, especially for current events, recent developments, or real-time data.\n\nWEB SEARCH RESULTS:\n${webSearchContext.context}\n\n`;
      }

      if (ragContext || webSearchContext) {
        enhancedSystemPrompt += `\nPlease provide a helpful, accurate response based on the provided context(s) and the user's question. If the context doesn't fully answer the question, acknowledge what information is available and what isn't.`;
      }

      // Format the conversation history
      const messages: GroqMessage[] = [
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
        const errorData = (await response.json()) as any;
        console.error("Groq API Error:", errorData);

        if (response.status === 401) {
          return "I'm having trouble with my API configuration. Please check the Groq API key! 🔧";
        } else if (response.status === 429) {
          return "I'm getting too many requests right now. Please wait a moment and try again! ⏳";
        } else {
          return "I'm experiencing some technical difficulties. Please try again in a moment! 🤖";
        }
      }

      const data = (await response.json()) as GroqAPIResponse;

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
  async getAIResponseWithFlowData(
    userMessage: string,
    conversationHistory: Message[] = [],
    providedRagContext?: { context: string; sources: any[] } | null,
    providedWebSearchContext?: { context: string; results: any[] } | null,
    attachments?: Array<{
      name: string;
      type: string;
      size: number;
      content?: string;
    }>,
  ): Promise<GroqResponse> {
    const startTime = Date.now();
    const flowData: GroqResponse = {
      response: null,
      ragUsed: false,
      ragContext: null,
      webSearchUsed: false,
      webSearchContext: null,
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

      // Step 1: RAG Processing (only if not provided)
      let ragContext: { context: string; sources: any[] } | null =
        providedRagContext || null;

      if (providedRagContext === undefined) {
        // RAG context not provided, fetch it
        const ragStartTime = Date.now();
        const ragStep: ProcessingStep = {
          id: "rag-processing",
          name: "RAG Processing",
          description:
            "Checking RAG service availability and context retrieval",
          status: "active",
          timestamp: new Date().toISOString(),
        };
        flowData.processingSteps?.push(ragStep);

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
            (ragError as Error).message,
          );
          if (ragStep) {
            ragStep.status = "error";
            ragStep.data = { error: (ragError as Error).message };
          }
        }

        const ragDuration = Date.now() - ragStartTime;
        if (ragStep) {
          ragStep.status = ragStep.status === "error" ? "error" : "completed";
          ragStep.duration = ragDuration;
          ragStep.data = {
            ...ragStep.data,
            ragAvailable: !!ragContext,
            ragUsed: !!ragContext,
            processingTime: ragDuration,
          };
        }
      } else {
        // Use provided context
        if (ragContext) {
          flowData.ragUsed = true;
          flowData.ragContext = ragContext;
        }
      }

      // Step 2: Web Search Processing (only if not provided)
      let webSearchContext: { context: string; results: any[] } | null =
        providedWebSearchContext || null;

      if (providedWebSearchContext === undefined) {
        // Web search context not provided, fetch it
        const webSearchStartTime = Date.now();
        const webSearchStep: ProcessingStep = {
          id: "web-search-processing",
          name: "Web Search Processing",
          description:
            "Checking if web search is needed and retrieving current information",
          status: "active",
          timestamp: new Date().toISOString(),
        };
        flowData.processingSteps?.push(webSearchStep);

        try {
          // Check if web search should be performed for this query
          const shouldSearch = webSearchService.shouldSearch(userMessage);

          if (shouldSearch) {
            console.log(
              "Web search triggered, enhancing response with current information...",
            );

            // Get contextual web search results
            webSearchContext =
              await webSearchService.getContextualWebSearch(userMessage);

            if (webSearchContext) {
              flowData.webSearchUsed = true;
              flowData.webSearchContext = webSearchContext;
            }
          } else {
            console.log("Web search not needed for this query");
          }
        } catch (webSearchError) {
          console.warn(
            "Web search failed, continuing without web context:",
            (webSearchError as Error).message,
          );
          if (webSearchStep) {
            webSearchStep.status = "error";
            webSearchStep.data = { error: (webSearchError as Error).message };
          }
        }

        const webSearchDuration = Date.now() - webSearchStartTime;
        if (webSearchStep) {
          webSearchStep.status =
            webSearchStep.status === "error" ? "error" : "completed";
          webSearchStep.duration = webSearchDuration;
          webSearchStep.data = {
            ...webSearchStep.data,
            searchPerformed: !!webSearchContext,
            webSearchUsed: !!webSearchContext,
            processingTime: webSearchDuration,
            resultsCount: webSearchContext?.results?.length || 0,
          };
        }
      } else {
        // Use provided context
        if (webSearchContext) {
          flowData.webSearchUsed = true;
          flowData.webSearchContext = webSearchContext;
        }
      }

      // Step 3: Groq API Processing
      const groqStartTime = Date.now();
      const groqStep: ProcessingStep = {
        id: "groq-processing",
        name: "Groq API Processing",
        description: "Sending request to Groq API and processing response",
        status: "active",
        timestamp: new Date().toISOString(),
      };
      flowData.processingSteps?.push(groqStep);

      // Build enhanced system prompt with RAG, web search, and attachments context
      let enhancedSystemPrompt = systemPrompt;

      // Add attachments context if provided
      if (attachments && attachments.length > 0) {
        const formatted = attachments
          .map(
            (
              a: { name: string; type: string; size: number; content?: string },
              idx: number,
            ) => {
              const header = `[Attachment ${idx + 1}] ${a.name} (${a.type}, ${Math.round(
                a.size / 1024,
              )} KB)`;
              const body = a.content
                ? `\nContent (truncated):\n${a.content.substring(0, 4000)}`
                : "";
              return `${header}${body}`;
            },
          )
          .join("\n\n");
        enhancedSystemPrompt += `\n\nATTACHMENTS PROVIDED BY USER:\n${formatted}\n`;
      }

      // Add RAG context if available
      if (ragContext) {
        enhancedSystemPrompt += `\n\nIMPORTANT: Use the following context from your knowledge base to provide accurate, detailed answers. If the context doesn't contain relevant information, say so clearly.\n\nKNOWLEDGE BASE CONTEXT:\n${ragContext.context}\n\n`;
      }

      // Add web search context if available
      if (webSearchContext) {
        enhancedSystemPrompt += `\n\nCURRENT WEB INFORMATION: The following information was retrieved from web sources to provide up-to-date information. Use this to supplement your knowledge, especially for current events, recent developments, or real-time data.\n\nWEB SEARCH RESULTS:\n${webSearchContext.context}\n\n`;
      }

      // Final instruction
      if (ragContext || webSearchContext) {
        enhancedSystemPrompt += `\nPlease provide a helpful, accurate response based on the provided context(s) and the user's question. If the context doesn't fully answer the question, acknowledge what information is available and what isn't.`;
      }

      // Format the conversation history
      const messages: GroqMessage[] = [
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
        const errorData = (await response.json()) as any;
        console.error("Groq API Error:", errorData);

        if (groqStep) {
          groqStep.status = "error";
          groqStep.duration = groqDuration;
          groqStep.data = {
            error: errorData,
            status: response.status,
          };
        }

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

      const data = (await response.json()) as GroqAPIResponse;

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected response structure:", data);
        if (groqStep) {
          groqStep.status = "error";
          groqStep.duration = groqDuration;
          groqStep.data = {
            error: "Unexpected response structure",
            data,
          };
        }
        flowData.response =
          "I received an unexpected response. Please try again! 🤔";
        return flowData;
      }

      flowData.response = data.choices[0].message.content.trim();
      flowData.tokens = data.usage?.total_tokens || null;
      if (groqStep) {
        groqStep.status = "completed";
        groqStep.duration = groqDuration;
        groqStep.data = {
          model: this.model,
          tokens: flowData.tokens,
          processingTime: groqDuration,
          responseLength: flowData.response?.length || 0,
        };
      }

      return flowData;
    } catch (error) {
      console.error("Groq API Error:", error);
      flowData.response =
        "I'm having trouble connecting to the AI service. Please try again in a moment! 🔧";

      // Mark the last step as error if it exists
      if (flowData.processingSteps && flowData.processingSteps.length > 0) {
        const lastStep =
          flowData.processingSteps[flowData.processingSteps.length - 1];
        if (lastStep.status === "active") {
          lastStep.status = "error";
          lastStep.data = { ...lastStep.data, error: (error as Error).message };
        }
      }

      return flowData;
    }
  }

  // Check if service is properly configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get service status
  async getStatus(): Promise<any> {
    try {
      const ragStatus = await ragService.getStatus();

      const webSearchStatus = await webSearchService.getStatus();

      return {
        configured: this.isConfigured(),
        model: this.model,
        maxTokens: this.maxTokens,
        temperature: this.temperature,
        rag: ragStatus,
        webSearch: webSearchStatus,
      };
    } catch (error) {
      return {
        configured: this.isConfigured(),
        model: this.model,
        maxTokens: this.maxTokens,
        temperature: this.temperature,
        rag: { available: false, error: (error as Error).message },
        webSearch: { available: false, error: (error as Error).message },
      };
    }
  }
}

export default new GroqService();
