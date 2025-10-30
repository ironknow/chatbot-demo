/* eslint-disable no-console */
import axios, { AxiosResponse } from "axios";
import {
  ChatResponse,
  ApiHealthResponse,
  Message,
  ChatService,
  ConversationsResponse,
} from "@/types";

interface StepUpdate {
  id: string;
  name: string;
  description: string;
  status: "pending" | "active" | "completed" | "error" | "skipped";
  timestamp?: string;
  data?: any;
}

interface StreamCallbacks {
  onStep?: (_step: StepUpdate) => void;
  onComplete?: (_data: ChatResponse) => void;
  onError?: (_error: Error) => void;
}

class ChatServiceImpl implements ChatService {
  private baseURL = "http://localhost:5000/api";

  async sendMessage(
    message: string,
    conversationId: string,
    attachments?: Array<{
      name: string;
      type: string;
      size: number;
      content?: string;
    }>,
  ): Promise<ChatResponse> {
    try {
      const response: AxiosResponse<ChatResponse> = await axios.post(
        `${this.baseURL}/chat`,
        {
          message,
          conversationId,
          attachments,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  async sendMessageStream(
    message: string,
    conversationId: string,
    callbacks: StreamCallbacks,
    attachments?: Array<{
      name: string;
      type: string;
      size: number;
      content?: string;
    }>,
  ): Promise<void> {
    // Note: EventSource doesn't support POST, so we use fetch with ReadableStream instead
    return this.sendMessageStreamPost(
      message,
      conversationId,
      callbacks,
      attachments,
    );
  }

  private async sendMessageStreamPost(
    message: string,
    conversationId: string,
    callbacks: StreamCallbacks,
    attachments?: Array<{
      name: string;
      type: string;
      size: number;
      content?: string;
    }>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(`${this.baseURL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, conversationId, attachments }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            reject(new Error("Response body is not readable"));
            return;
          }

          let buffer = "";

          const processStream = async () => {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.trim()) continue;

                const [eventLine, dataLine] = line.split("\n");
                const eventMatch = eventLine.match(/^event: (.+)$/);
                const dataMatch = dataLine.match(/^data: (.+)$/);

                if (eventMatch && dataMatch) {
                  const eventType = eventMatch[1];
                  const data = JSON.parse(dataMatch[1]);

                  if (eventType === "step" && callbacks.onStep) {
                    callbacks.onStep(data);
                  } else if (eventType === "complete" && callbacks.onComplete) {
                    callbacks.onComplete(data);
                    resolve();
                    return;
                  } else if (eventType === "error" && callbacks.onError) {
                    callbacks.onError(new Error(data.error || "Unknown error"));
                    reject(new Error(data.error || "Unknown error"));
                    return;
                  }
                }
              }
            }
          };

          processStream().catch((error) => {
            if (callbacks.onError) {
              callbacks.onError(error);
            }
            reject(error);
          });
        })
        .catch((error) => {
          if (callbacks.onError) {
            callbacks.onError(error);
          }
          reject(error);
        });
    });
  }

  async getConversation(
    conversationId: string,
  ): Promise<{ messages: Message[] }> {
    try {
      const response: AxiosResponse<{ messages: Message[] }> = await axios.get(
        `${this.baseURL}/chat/${conversationId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw new Error("Failed to get conversation");
    }
  }

  async getAllConversations(): Promise<ConversationsResponse> {
    try {
      const response: AxiosResponse<ConversationsResponse> = await axios.get(
        `${this.baseURL}/chat`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting conversations:", error);
      throw new Error("Failed to get conversations");
    }
  }

  async clearConversation(
    conversationId: string,
  ): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseURL}/chat/${conversationId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error clearing conversation:", error);
      throw new Error("Failed to clear conversation");
    }
  }

  async checkHealth(): Promise<ApiHealthResponse> {
    try {
      const response: AxiosResponse<ApiHealthResponse> = await axios.get(
        `${this.baseURL}/health`,
      );
      return response.data;
    } catch (error) {
      console.error("Error checking health:", error);
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        message: "API not reachable",
      };
    }
  }
}

export const chatService = new ChatServiceImpl();
export default chatService;
