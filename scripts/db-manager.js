#!/usr/bin/env node

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Change to root directory
process.chdir(rootDir);

const commands = {
  up: () => {
    console.log("🐳 Starting PostgreSQL database...");
    execSync("docker compose up -d", { stdio: "inherit" });
    console.log("✅ Database started successfully!");
    console.log("📊 pgAdmin available at: http://localhost:5050");
    console.log(
      "🔗 Database connection: postgresql://chatbot_user:chatbot_password@localhost:5432/chatbot_db",
    );
  },

  down: () => {
    console.log("🛑 Stopping PostgreSQL database...");
    execSync("docker compose down", { stdio: "inherit" });
    console.log("✅ Database stopped successfully!");
  },

  restart: () => {
    console.log("🔄 Restarting PostgreSQL database...");
    execSync("docker compose restart", { stdio: "inherit" });
    console.log("✅ Database restarted successfully!");
  },

  logs: () => {
    console.log("📋 Showing database logs...");
    execSync("docker compose logs -f", { stdio: "inherit" });
  },

  status: () => {
    console.log("📊 Database status:");
    execSync("docker compose ps", { stdio: "inherit" });
  },

  reset: () => {
    console.log("🗑️  Resetting database (this will delete all data)...");
    execSync("docker compose down -v", { stdio: "inherit" });
    execSync("docker compose up -d", { stdio: "inherit" });
    console.log("✅ Database reset successfully!");
  },

  setup: async () => {
    console.log("🚀 Setting up complete database environment...");

    try {
      // Start database
      console.log("🐳 Starting database...");
      execSync("docker compose up -d", { stdio: "inherit" });

      // Wait a moment for database to be ready
      console.log("⏳ Waiting for database to be ready...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Setup API database
      console.log("🔧 Setting up API database...");
      execSync("pnpm --filter api db:setup", { stdio: "inherit" });

      console.log("✅ Complete database setup finished!");
      console.log("🎯 You can now run: pnpm dev");
    } catch (error) {
      console.error("❌ Error during setup:", error.message);
      process.exit(1);
    }
  },

  help: () => {
    console.log(`
🗄️  Database Manager

Available commands:
  up        Start PostgreSQL database
  down      Stop PostgreSQL database
  restart   Restart PostgreSQL database
  logs      Show database logs
  status    Show database status
  reset     Reset database (delete all data)
  setup     Complete setup (start DB + configure API)
  help      Show this help message

Usage:
  pnpm db:up        # Start database
  pnpm db:down      # Stop database
  pnpm db:setup     # Complete setup
  pnpm db:status    # Check status
  pnpm db:logs      # View logs
  pnpm db:reset     # Reset everything

Environment:
  Database: postgresql://chatbot_user:chatbot_password@localhost:5432/chatbot_db
  pgAdmin:  http://localhost:5050 (admin@chatbot.com / admin)
    `);
  },
};

const command = process.argv[2] || "help";

if (commands[command]) {
  commands[command]();
} else {
  console.error(`❌ Unknown command: ${command}`);
  commands.help();
  process.exit(1);
}
