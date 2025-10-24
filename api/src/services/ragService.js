import fetch from "node-fetch";

export class RAGService {
  constructor() {
    this.ragBaseURL = "http://localhost:8000";
    this.timeout = 30000; // 30 seconds timeout
  }

  // Check if RAG service is available
  async isAvailable() {
    try {
      const response = await fetch(`${this.ragBaseURL}/health`, {
        method: "GET",
        timeout: 5000,
      });

      if (response.ok) {
        const healthData = await response.json();
        return healthData.status === "healthy" && healthData.rag_flow_ready;
      }
      return false;
    } catch (error) {
      console.warn(
        "RAG service not available - continuing without RAG enhancement:",
        error.message,
      );
      return false;
    }
  }

  // Search documents using RAG
  async searchDocuments(query) {
    try {
      const response = await fetch(`${this.ragBaseURL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(
          `RAG search failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("RAG search error:", error);
      return [];
    }
  }

  // Get RAG-enhanced response
  async getRAGResponse(query) {
    try {
      const response = await fetch(`${this.ragBaseURL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(
          `RAG chat failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
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
  async getContextualSearch(query, maxResults = 3) {
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
  async getStatus() {
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
        error: error.message,
      };
    }
  }
}

export default new RAGService();
