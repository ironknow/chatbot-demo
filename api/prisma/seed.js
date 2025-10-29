import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a sample conversation
  const sampleConversation = await prisma.conversation.create({
    data: {
      id: "sample-conversation-1",
      title: "Welcome to Chatbot Demo",
      messages: {
        create: [
          {
            sender: "bot",
            text: "Hello! I'm your AI assistant. How can I help you today?",
            timestamp: new Date("2024-01-01T10:00:00Z"),
          },
          {
            sender: "user",
            text: "Hi there! What can you do?",
            timestamp: new Date("2024-01-01T10:01:00Z"),
          },
          {
            sender: "bot",
            text: "I can help you with various tasks like answering questions, having conversations, providing information, and much more! Feel free to ask me anything.",
            timestamp: new Date("2024-01-01T10:01:30Z"),
          },
        ],
      },
    },
  });

  console.log("✅ Sample conversation created:", sampleConversation.id);

  // Create another sample conversation
  const anotherConversation = await prisma.conversation.create({
    data: {
      id: "sample-conversation-2",
      title: "Technical Discussion",
      messages: {
        create: [
          {
            sender: "user",
            text: "Can you explain how databases work?",
            timestamp: new Date("2024-01-01T11:00:00Z"),
          },
          {
            sender: "bot",
            text: "Databases are organized collections of data that can be easily accessed, managed, and updated. They use structured query language (SQL) for relational databases or NoSQL for non-relational databases.",
            timestamp: new Date("2024-01-01T11:00:30Z"),
          },
        ],
      },
    },
  });

  console.log(
    "✅ Another sample conversation created:",
    anotherConversation.id,
  );

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
