// In-memory conversation storage
// In production, replace with a real database like MongoDB, PostgreSQL, etc.

class ConversationStore {
  constructor() {
    this.conversations = new Map();
  }

  get(conversationId) {
    return this.conversations.get(conversationId) || [];
  }

  set(conversationId, messages) {
    // Keep only last 20 messages to prevent memory issues
    this.conversations.set(conversationId, messages.slice(-20));
  }

  delete(conversationId) {
    this.conversations.delete(conversationId);
  }

  clear() {
    this.conversations.clear();
  }

  size() {
    return this.conversations.size;
  }
}

export default new ConversationStore();
