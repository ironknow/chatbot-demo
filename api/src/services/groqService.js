import fetch from "node-fetch";
import { groqConfig, systemPrompt } from "../config/groq.js";

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
    return conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
  }

  // Get AI response from Groq
  async getAIResponse(userMessage, conversationHistory = []) {
    try {
      // Check if API key is configured
      if (!this.apiKey) {
        return "🤖 I'm not properly configured yet. Please set up the Groq API key to enable AI responses!";
      }

      // Format the conversation history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.formatConversationForAI(conversationHistory),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
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
        console.error('Groq API Error:', errorData);
        
        if (response.status === 401) {
          return "I'm having trouble with my API configuration. Please check the Groq API key! 🔧";
        } else if (response.status === 429) {
          return "I'm getting too many requests right now. Please wait a moment and try again! ⏳";
        } else {
          return "I'm experiencing some technical difficulties. Please try again in a moment! 🤖";
        }
      }

      const data = await response.json();
      console.log('Groq API Response:', data); // Debug log
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected response structure:', data);
        return "I received an unexpected response. Please try again! 🤔";
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Groq API Error:', error);
      return "I'm having trouble connecting to the AI service. Please try again in a moment! 🔧";
    }
  }

  // Check if service is properly configured
  isConfigured() {
    return !!this.apiKey;
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured(),
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature
    };
  }
}

export default new GroqService();
