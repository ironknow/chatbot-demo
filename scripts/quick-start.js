#!/usr/bin/env node

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Change to root directory
process.chdir(rootDir);

console.log("🚀 Quick Start - Chatbot Demo");
console.log("==============================\n");

try {
  // Step 1: Install dependencies
  console.log("📦 Installing dependencies...");
  execSync("pnpm install", { stdio: "inherit" });

  // Step 2: Setup environment
  console.log("\n🔧 Setting up environment...");
  execSync("pnpm --filter api exec cp env.example .env", { stdio: "inherit" });

  // Step 3: Start database
  console.log("\n🐳 Starting database...");
  execSync("pnpm db:up", { stdio: "inherit" });

  // Step 4: Wait for database
  console.log("\n⏳ Waiting for database to be ready...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Step 5: Setup API database
  console.log("\n🗄️  Setting up API database...");
  execSync("pnpm --filter api db:setup", { stdio: "inherit" });

  console.log("\n✅ Setup complete! 🎉");
  console.log("\n📋 Next steps:");
  console.log("  1. Edit api/.env with your GROQ_API_KEY");
  console.log("  2. Run: pnpm dev");
  console.log("\n🌐 Access points:");
  console.log("  - Web app: http://localhost:3000");
  console.log("  - API: http://localhost:3001");
  console.log("  - pgAdmin: http://localhost:5050");
  console.log("\n💡 Useful commands:");
  console.log("  - pnpm db:status  # Check database status");
  console.log("  - pnpm db:logs    # View database logs");
  console.log("  - pnpm db:studio  # Open Prisma Studio");
} catch (error) {
  console.error("\n❌ Setup failed:", error.message);
  console.log("\n🔧 Troubleshooting:");
  console.log("  - Make sure Docker is running");
  console.log("  - Check if ports 3000, 3001, 5432, 5050 are available");
  console.log("  - Run: pnpm db:help for database commands");
  process.exit(1);
}
