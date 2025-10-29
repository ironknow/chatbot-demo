import prisma from "../lib/prisma.js";
import type {
  Message,
  ConversationStore as IConversationStore,
} from "../types/index.js";

class ConversationStore implements IConversationStore {
  private inMemoryStore: Map<string, Message[]> = new Map();
  private databaseAvailable: boolean = true;
  private lastDatabaseCheck: number = 0;
  private readonly databaseCheckInterval: number = 30000; // Check every 30 seconds

  // Check if database is available
  private async checkDatabaseAvailability(): Promise<boolean> {
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
        (error as Error).message,
      );
      this.databaseAvailable = false;
      this.lastDatabaseCheck = now;
      return false;
    }
  }

  // Get conversation messages
  async get(conversationId: string): Promise<Message[]> {
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
          const messages: Message[] = conversation.messages.map((msg: any) => ({
            sender: msg.sender as "user" | "bot",
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
      console.warn(
        "Database error, using in-memory storage:",
        (error as Error).message,
      );
      return this.inMemoryStore.get(conversationId) || [];
    }
  }

  // Create or update conversation with messages
  async set(
    conversationId: string,
    messages: Message[],
    title?: string,
  ): Promise<void> {
    try {
      // Keep only last 20 messages to prevent bloat
      const recentMessages = messages.slice(-20);

      // Always store in memory first
      this.inMemoryStore.set(conversationId, recentMessages);

      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        // Store in database
        await prisma.conversation.upsert({
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
        });
      }
    } catch (error) {
      console.warn(
        "Database error, using in-memory storage:",
        (error as Error).message,
      );
    }
  }

  // Delete conversation
  async delete(conversationId: string): Promise<boolean> {
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
      console.warn(
        "Database error, removed from memory only:",
        (error as Error).message,
      );
      return true; // Still return true since we removed from memory
    }
  }

  // Clear all conversations
  async clear(): Promise<boolean> {
    try {
      // Clear memory first
      this.inMemoryStore.clear();

      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        await prisma.conversation.deleteMany();
      }

      return true;
    } catch (error) {
      console.warn(
        "Database error, cleared memory only:",
        (error as Error).message,
      );
      return true; // Still return true since we cleared memory
    }
  }

  // Get conversation count
  async size(): Promise<number> {
    try {
      const dbAvailable = await this.checkDatabaseAvailability();

      if (dbAvailable) {
        return await prisma.conversation.count();
      }

      return this.inMemoryStore.size;
    } catch (error) {
      console.warn(
        "Database error, returning memory count:",
        (error as Error).message,
      );
      return this.inMemoryStore.size;
    }
  }

  // Get all conversations with metadata
  async getAll(): Promise<any[]> {
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

        return conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          lastMessage: conv.messages[0]?.text || "No messages",
          updatedAt: conv.updatedAt.toISOString(),
          messageCount: conv._count.messages,
        }));
      }

      // Fallback to in-memory conversations
      const conversations: any[] = [];
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
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    } catch (error) {
      console.warn(
        "Database error, returning memory conversations:",
        (error as Error).message,
      );
      return [];
    }
  }

  // Get storage status
  getStorageStatus(): any {
    return {
      databaseAvailable: this.databaseAvailable,
      memoryConversations: this.inMemoryStore.size,
      lastDatabaseCheck: new Date(this.lastDatabaseCheck).toISOString(),
    };
  }
}

export default new ConversationStore();
