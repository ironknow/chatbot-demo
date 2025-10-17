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
      const conversationHistory = conversationStore.get(conversationId);
      
      // Get AI response
      const aiResponse = await groqService.getAIResponse(userMessage, conversationHistory);
      
      // Store the conversation
      const newMessages = [
        ...conversationHistory,
        { sender: 'user', text: userMessage, timestamp: new Date().toISOString() },
        { sender: 'bot', text: aiResponse, timestamp: new Date().toISOString() }
      ];
      
      conversationStore.set(conversationId, newMessages);
      
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
    const { conversationId } = req.params;
    const history = conversationStore.get(conversationId);
    res.json({ messages: history });
  }

  // Clear conversation history
  async clearConversation(req, res) {
    const { conversationId } = req.params;
    conversationStore.delete(conversationId);
    res.json({ message: "Conversation cleared successfully" });
  }

  // Health check
  async healthCheck(req, res) {
    const groqStatus = groqService.getStatus();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      groq: groqStatus,
      conversations: conversationStore.size()
    });
  }
}

export default new ChatController();
