#!/usr/bin/env node

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const apiDir = join(__dirname, "..");

console.log("🚀 Setting up database...");

try {
  // Change to API directory
  process.chdir(apiDir);

  console.log("📦 Installing dependencies...");
  execSync("pnpm install", { stdio: "inherit" });

  console.log("🔧 Generating Prisma client...");
  execSync("pnpm db:generate", { stdio: "inherit" });

  console.log("🗄️  Pushing database schema...");
  execSync("pnpm db:push", { stdio: "inherit" });

  console.log("🌱 Seeding database...");
  execSync("pnpm db:seed", { stdio: "inherit" });

  console.log("✅ Database setup completed successfully!");
  console.log("🎯 You can now start the API server with: pnpm dev");
} catch (error) {
  console.error("❌ Error setting up database:", error.message);
  process.exit(1);
}
