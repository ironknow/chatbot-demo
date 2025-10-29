import fetch from "node-fetch";

interface RAGSearchResult {
  content: string;
  metadata?: {
    source?: string;
    page?: number;
  };
}

interface ContextualSearchResult {
  context: string;
  sources: Array<{
    content: string;
    source: string;
    page: number | null;
  }>;
}

interface RAGStatus {
  available: boolean;
  baseURL: string;
  timeout: number;
  error?: string;
}

interface RAGHealthResponse {
  status?: string;
  rag_flow_ready?: boolean;
}

interface RAGSearchResponse {
  results?: RAGSearchResult[];
}

interface RAGChatResponse {
  response?: string;
  answer?: string;
}

export class RAGService {
  private ragBaseURL: string;
  private timeout: number;

  constructor() {
    this.ragBaseURL = "http://localhost:8000";
    this.timeout = 30000; // 30 seconds timeout
  }

  // Check if RAG service is available
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ragBaseURL}/health`, {
        method: "GET",
      } as any);

      if (response.ok) {
        const healthData = (await response.json()) as RAGHealthResponse;
        return (
          healthData.status === "healthy" &&
          (healthData.rag_flow_ready || false)
        );
      }
      return false;
    } catch (error) {
      console.warn(
        "RAG service not available - continuing without RAG enhancement:",
        (error as Error).message,
      );
      return false;
    }
  }

  // Search documents using RAG
  async searchDocuments(query: string): Promise<RAGSearchResult[]> {
    try {
      const response = await fetch(`${this.ragBaseURL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      } as any);

      if (!response.ok) {
        throw new Error(
          `RAG search failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as RAGSearchResponse;
      return data.results || [];
    } catch (error) {
      console.error("RAG search error:", error);
      return [];
    }
  }

  // Get RAG-enhanced response
  async getRAGResponse(query: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.ragBaseURL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      } as any);

      if (!response.ok) {
        throw new Error(
          `RAG chat failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as RAGChatResponse;
      return (
        data.response ||
        data.answer ||
        "I couldn't generate a response from the RAG system."
      );
    } catch (error) {
      console.error("RAG chat error:", error);
      return null;
    }
  }

  // Enhanced search with context formatting
  async getContextualSearch(
    query: string,
    maxResults: number = 3,
  ): Promise<ContextualSearchResult | null> {
    try {
      const results = await this.searchDocuments(query);

      if (results.length === 0) {
        return null;
      }

      // Format results for context
      const context = results
        .slice(0, maxResults)
        .map((result, index) => {
          const source = result.metadata?.source || "Unknown source";
          const page = result.metadata?.page
            ? ` (Page ${result.metadata.page})`
            : "";
          return `[Context ${index + 1} from ${source}${page}]:\n${result.content}`;
        })
        .join("\n\n");

      return {
        context,
        sources: results.slice(0, maxResults).map((r) => ({
          content: r.content,
          source: r.metadata?.source || "Unknown",
          page: r.metadata?.page || null,
        })),
      };
    } catch (error) {
      console.error("Contextual search error:", error);
      return null;
    }
  }

  // Get service status
  async getStatus(): Promise<RAGStatus> {
    try {
      const isAvailable = await this.isAvailable();
      return {
        available: isAvailable,
        baseURL: this.ragBaseURL,
        timeout: this.timeout,
      };
    } catch (error) {
      return {
        available: false,
        baseURL: this.ragBaseURL,
        timeout: this.timeout,
        error: (error as Error).message,
      };
    }
  }
}

export default new RAGService();
