import groqService from "../services/groqService.js";
import conversationStore from "../config/database.js";

export class ChatController {
  // Main chat endpoint
  async sendMessage(req, res) {
    const { message, conversationId } = req.body;
    const userMessage = message?.trim() || "";

    if (!userMessage) {
      return res.json({
        reply: "I didn't receive a message. Could you please try again? 😊",
        conversationId: conversationId || 'default',
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Get conversation history
      const conversationHistory = await conversationStore.get(conversationId);

      // Get AI response
      const aiResponse = await groqService.getAIResponse(userMessage, conversationHistory);

      // Store the conversation
      const newMessages = [
        ...conversationHistory,
        { sender: 'user', text: userMessage, timestamp: new Date().toISOString() },
        { sender: 'bot', text: aiResponse, timestamp: new Date().toISOString() }
      ];

      await conversationStore.set(conversationId, newMessages);

      res.json({
        reply: aiResponse,
        conversationId: conversationId || 'default',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({
        reply: "I'm experiencing some technical difficulties. Please try again in a moment! 🔧",
        conversationId: conversationId || 'default',
        timestamp: new Date().toISOString()
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
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }

  // Get all conversations
  async getAllConversations(req, res) {
    try {
      const conversations = await conversationStore.getAll();
      res.json({ conversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
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
      console.error('Error clearing conversation:', error);
      res.status(500).json({ error: 'Failed to clear conversation' });
    }
  }

  // Health check
  async healthCheck(req, res) {
    try {
      const groqStatus = groqService.getStatus();
      const conversationCount = await conversationStore.size();

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        groq: groqStatus,
        conversations: conversationCount
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new ChatController();
