import prisma from "../lib/prisma.js";

class ConversationStore {
  constructor() {
    this.inMemoryStore = new Map(); // Fallback in-memory storage
    this.databaseAvailable = true;
    this.lastDatabaseCheck = 0;
    this.databaseCheckInterval = 30000; // Check every 30 seconds
  }

  // Check if database is available
  async checkDatabaseAvailability() {
    const now = Date.now();
    if (now - this.lastDatabaseCheck < this.databaseCheckInterval) {
      return this.databaseAvailable;
    }

    try {
      await prisma.$queryRaw`SELECT 1`;
      this.databaseAvailable = true;
      this.lastDatabaseCheck = now;
      return true;
    } catch (error) {
      console.warn(
        "Database unavailable, using in-memory storage:",
        error.message,
      );
      this.databaseAvailable = false;
      this.lastDatabaseCheck = now;
      return false;
    }
  }

  // Get conversation messages
  async get(conversationId) {
    try {
      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            messages: {
              orderBy: { timestamp: "asc" },
            },
          },
        });

        if (conversation) {
          const messages = conversation.messages.map((msg) => ({
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp.toISOString(),
          }));

          // Also store in memory as backup
          this.inMemoryStore.set(conversationId, messages);
          return messages;
        }
      }

      // Fallback to in-memory storage
      return this.inMemoryStore.get(conversationId) || [];
    } catch (error) {
      console.warn("Database error, using in-memory storage:", error.message);
      return this.inMemoryStore.get(conversationId) || [];
    }
  }

  // Create or update conversation with messages
  async set(conversationId, messages, title = null) {
    try {
      // Keep only last 20 messages to prevent bloat
      const recentMessages = messages.slice(-20);

      // Always store in memory first
      this.inMemoryStore.set(conversationId, recentMessages);

      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        // Store in database
        const conversation = await prisma.conversation.upsert({
          where: { id: conversationId },
          update: {
            updatedAt: new Date(),
            messages: {
              deleteMany: {}, // Clear existing messages
              create: recentMessages.map((msg) => ({
                sender: msg.sender,
                text: msg.text,
                timestamp: new Date(msg.timestamp),
              })),
            },
          },
          create: {
            id: conversationId,
            title:
              title ||
              recentMessages[0]?.text?.substring(0, 50) ||
              "New Conversation",
            messages: {
              create: recentMessages.map((msg) => ({
                sender: msg.sender,
                text: msg.text,
                timestamp: new Date(msg.timestamp),
              })),
            },
          },
          include: {
            messages: {
              orderBy: { timestamp: "asc" },
            },
          },
        });

        return conversation.messages.map((msg) => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp.toISOString(),
        }));
      }

      // Return in-memory messages
      return recentMessages;
    } catch (error) {
      console.warn("Database error, using in-memory storage:", error.message);
      return this.inMemoryStore.get(conversationId) || [];
    }
  }

  // Delete conversation
  async delete(conversationId) {
    try {
      // Always remove from memory
      this.inMemoryStore.delete(conversationId);

      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        await prisma.conversation.delete({
          where: { id: conversationId },
        });
      }

      return true;
    } catch (error) {
      console.warn("Database error, removed from memory only:", error.message);
      return true; // Still return true since we removed from memory
    }
  }

  // Clear all conversations
  async clear() {
    try {
      // Clear memory first
      this.inMemoryStore.clear();

      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        await prisma.conversation.deleteMany();
      }

      return true;
    } catch (error) {
      console.warn("Database error, cleared memory only:", error.message);
      return true; // Still return true since we cleared memory
    }
  }

  // Get conversation count
  async size() {
    try {
      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        return await prisma.conversation.count();
      }

      return this.inMemoryStore.size;
    } catch (error) {
      console.warn("Database error, returning memory count:", error.message);
      return this.inMemoryStore.size;
    }
  }

  // Get all conversations with metadata
  async getAll() {
    try {
      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        const conversations = await prisma.conversation.findMany({
          include: {
            messages: {
              orderBy: { timestamp: "desc" },
              take: 1, // Only get the last message for preview
            },
            _count: {
              select: { messages: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        });

        return conversations.map((conv) => ({
          id: conv.id,
          title: conv.title,
          lastMessage: conv.messages[0]?.text || "No messages",
          updatedAt: conv.updatedAt.toISOString(),
          messageCount: conv._count.messages,
        }));
      }

      // Fallback to in-memory conversations
      const conversations = [];
      for (const [id, messages] of this.inMemoryStore.entries()) {
        conversations.push({
          id,
          title: messages[0]?.text?.substring(0, 50) || "New Conversation",
          lastMessage: messages[messages.length - 1]?.text || "No messages",
          updatedAt: new Date().toISOString(),
          messageCount: messages.length,
        });
      }

      return conversations.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
    } catch (error) {
      console.warn(
        "Database error, returning memory conversations:",
        error.message,
      );
      return [];
    }
  }

  // Get storage status
  getStorageStatus() {
    return {
      databaseAvailable: this.databaseAvailable,
      memoryConversations: this.inMemoryStore.size,
      lastDatabaseCheck: new Date(this.lastDatabaseCheck).toISOString(),
    };
  }
}

export default new ConversationStore();
