import prisma from '../lib/prisma.js';

class ConversationStore {
  // Get conversation messages
  async get(conversationId) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      return conversation?.messages || [];
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }
  }

  // Create or update conversation with messages
  async set(conversationId, messages) {
    try {
      // Keep only last 20 messages to prevent database bloat
      const recentMessages = messages.slice(-20);

      // Upsert conversation
      const conversation = await prisma.conversation.upsert({
        where: { id: conversationId },
        update: {
          updatedAt: new Date(),
          messages: {
            deleteMany: {}, // Clear existing messages
            create: recentMessages.map(msg => ({
              sender: msg.sender,
              text: msg.text,
              timestamp: new Date(msg.timestamp)
            }))
          }
        },
        create: {
          id: conversationId,
          title: recentMessages[0]?.text?.substring(0, 50) || 'New Conversation',
          messages: {
            create: recentMessages.map(msg => ({
              sender: msg.sender,
              text: msg.text,
              timestamp: new Date(msg.timestamp)
            }))
          }
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      return conversation.messages;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return [];
    }
  }

  // Delete conversation
  async delete(conversationId) {
    try {
      await prisma.conversation.delete({
        where: { id: conversationId }
      });
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Clear all conversations
  async clear() {
    try {
      await prisma.conversation.deleteMany();
      return true;
    } catch (error) {
      console.error('Error clearing conversations:', error);
      return false;
    }
  }

  // Get conversation count
  async size() {
    try {
      return await prisma.conversation.count();
    } catch (error) {
      console.error('Error getting conversation count:', error);
      return 0;
    }
  }

  // Get all conversations with metadata
  async getAll() {
    try {
      return await prisma.conversation.findMany({
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1 // Only get the last message for preview
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching all conversations:', error);
      return [];
    }
  }
}

export default new ConversationStore();
