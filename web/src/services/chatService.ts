import axios, { AxiosResponse } from 'axios';
import { ChatResponse, ApiHealthResponse, Message, ChatService } from '@/types';

class ChatServiceImpl implements ChatService {
  private baseURL = 'http://localhost:5000/api';

  async sendMessage(message: string, conversationId: string): Promise<ChatResponse> {
    try {
      const response: AxiosResponse<ChatResponse> = await axios.post(`${this.baseURL}/chat`, {
        message,
        conversationId,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async getConversation(conversationId: string): Promise<{ messages: Message[] }> {
    try {
      const response: AxiosResponse<{ messages: Message[] }> = await axios.get(
        `${this.baseURL}/chat/${conversationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw new Error('Failed to get conversation');
    }
  }

  async clearConversation(conversationId: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseURL}/chat/${conversationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw new Error('Failed to clear conversation');
    }
  }

  async checkHealth(): Promise<ApiHealthResponse> {
    try {
      const response: AxiosResponse<ApiHealthResponse> = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'API not reachable',
      };
    }
  }
}

export const chatService = new ChatServiceImpl();
export default chatService;
