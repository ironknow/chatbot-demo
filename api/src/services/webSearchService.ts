import fetch from "node-fetch";

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: "web";
}

interface ContextualWebSearchResult {
  context: string;
  results: WebSearchResult[];
}

interface WebSearchStatus {
  available: boolean;
  provider: string;
  enabled: boolean;
  error?: string;
}

interface DuckDuckGoResult {
  results?: Array<{
    title?: string;
    href?: string;
    body?: string;
  }>;
}

/**
 * Web Search Service
 * Provides web search functionality to enhance chatbot responses with current information
 */
export class WebSearchService {
  private enabled: boolean;
  private provider: string;
  private maxResults: number;
  private timeout: number;

  constructor() {
    this.enabled = process.env.WEB_SEARCH_ENABLED !== "false"; // Enabled by default
    this.provider = process.env.WEB_SEARCH_PROVIDER || "duckduckgo"; // Default to DuckDuckGo
    this.maxResults = parseInt(process.env.WEB_SEARCH_MAX_RESULTS || "3", 10);
    this.timeout = parseInt(process.env.WEB_SEARCH_TIMEOUT || "10000", 10); // 10 seconds
  }

  /**
   * Check if web search should be used for a query
   * Determines if the query would benefit from web search results
   */
  shouldSearch(query: string): boolean {
    if (!this.enabled) {
      return false;
    }

    // Keywords that suggest web search would be helpful
    const searchKeywords = [
      "current",
      "latest",
      "recent",
      "today",
      "now",
      "2024",
      "2025",
      "news",
      "update",
      "what is",
      "who is",
      "when did",
      "where is",
      "how to",
      "why is",
      "explain",
      "tell me about",
      "search",
      "find",
    ];

    const queryLower = query.toLowerCase();

    // Always search if explicitly requested
    if (queryLower.includes("search for") || queryLower.includes("look up")) {
      return true;
    }

    // Search if query contains time-sensitive keywords
    const hasSearchKeywords = searchKeywords.some((keyword) =>
      queryLower.includes(keyword),
    );

    // Search if query is asking a factual question
    const isQuestion = query.trim().endsWith("?");
    const hasQuestionWords =
      queryLower.startsWith("what") ||
      queryLower.startsWith("who") ||
      queryLower.startsWith("when") ||
      queryLower.startsWith("where") ||
      queryLower.startsWith("why") ||
      queryLower.startsWith("how");

    return hasSearchKeywords || (isQuestion && hasQuestionWords);
  }

  /**
   * Perform web search using DuckDuckGo
   * Uses DuckDuckGo's instant answer API and HTML scraping
   */
  async searchDuckDuckGo(query: string): Promise<WebSearchResult[]> {
    try {
      // First, try DuckDuckGo instant answer API for structured data
      const instantUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

      try {
        const instantResponse = await fetch(instantUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        } as any);

        if (instantResponse.ok) {
          const instantData = (await instantResponse.json()) as any;

          // Use instant answer if available
          if (instantData.AbstractText || instantData.Answer) {
            const abstract = instantData.AbstractText || instantData.Answer;
            const url = instantData.AbstractURL || instantData.AnswerType || "";

            return [
              {
                title: instantData.Heading || query,
                url:
                  url ||
                  `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
                snippet: abstract,
                source: "web",
              },
            ];
          }
        }
      } catch (instantError) {
        // Fall through to HTML scraping
        console.log("Instant answer API not available, using HTML search");
      }

      // Fallback to HTML search scraping
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(searchUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: controller.signal,
        } as any);

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`DuckDuckGo search failed: ${response.status}`);
        }

        const html = await response.text();

        // Parse HTML results with improved regex patterns
        const results: WebSearchResult[] = [];

        // Match result blocks - DuckDuckGo uses result__body class
        const resultBlockRegex =
          /<div class="result[^"]*">[\s\S]*?<\/div>\s*(?=<div class="result|$)/g;
        const blocks = html.match(resultBlockRegex) || [];

        for (const block of blocks.slice(0, this.maxResults)) {
          // Extract title and URL
          const titleMatch = block.match(
            /<a class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/,
          );
          if (!titleMatch) continue;

          const url = titleMatch[1];
          let title = this.decodeHtmlEntities(
            this.stripHtmlTags(titleMatch[2] || ""),
          ).trim();

          // Extract snippet
          let snippet = "";
          const snippetMatch = block.match(
            /<a class="result__snippet"[^>]*>(.*?)<\/a>/,
          );
          if (snippetMatch) {
            snippet = this.decodeHtmlEntities(
              this.stripHtmlTags(snippetMatch[1] || ""),
            ).trim();
          } else {
            // Try alternative snippet format
            const altSnippetMatch = block.match(
              /<span[^>]*class="result__snippet"[^>]*>(.*?)<\/span>/,
            );
            if (altSnippetMatch) {
              snippet = this.decodeHtmlEntities(
                this.stripHtmlTags(altSnippetMatch[1] || ""),
              ).trim();
            }
          }

          if (title && url) {
            results.push({
              title: title || "No title",
              url: url,
              snippet: snippet || "No description available",
              source: "web",
            });
          }
        }

        return results.slice(0, this.maxResults);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error(`Web search timeout after ${this.timeout}ms`);
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("DuckDuckGo search error:", error);
      throw error;
    }
  }

  /**
   * Perform web search using API-based providers (for future expansion)
   */
  async searchWithAPI(query: string): Promise<WebSearchResult[]> {
    // Placeholder for future API-based search providers (SerpAPI, Tavily, etc.)
    // Can be implemented when API keys are available
    throw new Error("API-based search not implemented yet");
  }

  /**
   * Perform web search based on configured provider
   */
  async searchWeb(query: string): Promise<WebSearchResult[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      switch (this.provider.toLowerCase()) {
        case "duckduckgo":
          return await this.searchDuckDuckGo(query);
        case "api":
          return await this.searchWithAPI(query);
        default:
          console.warn(`Unknown search provider: ${this.provider}`);
          return [];
      }
    } catch (error) {
      console.error("Web search error:", error);
      return []; // Return empty results on error, don't break the flow
    }
  }

  /**
   * Get contextual web search results formatted for LLM context
   */
  async getContextualWebSearch(
    query: string,
  ): Promise<ContextualWebSearchResult | null> {
    try {
      const results = await this.searchWeb(query);

      if (results.length === 0) {
        return null;
      }

      // Format results for context
      const context = results
        .map((result, index) => {
          return `[Web Source ${index + 1}: ${result.title} (${result.url})]:\n${result.snippet}`;
        })
        .join("\n\n");

      return {
        context,
        results,
      };
    } catch (error) {
      console.error("Contextual web search error:", error);
      return null;
    }
  }

  /**
   * Check if web search is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    // Test search to verify service is working
    try {
      const testResults = await this.searchWeb("test");
      return true;
    } catch (error) {
      console.warn(
        "Web search service not available:",
        (error as Error).message,
      );
      return false;
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<WebSearchStatus> {
    try {
      const available = await this.isAvailable();
      return {
        available,
        provider: this.provider,
        enabled: this.enabled,
      };
    } catch (error) {
      return {
        available: false,
        provider: this.provider,
        enabled: this.enabled,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&mdash;/g, "—")
      .replace(/&ndash;/g, "–")
      .replace(/&hellip;/g, "…");
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, "");
  }
}

export default new WebSearchService();
