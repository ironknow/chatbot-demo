# Database Setup Guide

This guide will help you set up PostgreSQL with Docker and Prisma for the chatbot demo.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and pnpm installed
- Git installed

## Quick Start

### 1. Start PostgreSQL with Docker

```bash
# Start the database and pgAdmin
docker-compose up -d

# Check if containers are running
docker-compose ps
```

### 2. Set up Environment Variables

```bash
# Copy the example environment file
cp api/env.example api/.env

# Edit the .env file with your actual values
nano api/.env
```

### 3. Install Dependencies and Set Up Database

```bash
# Install dependencies
pnpm install

# Set up the database (installs deps, generates client, pushes schema, seeds data)
cd api && node scripts/setup-db.js
```

### 4. Start the API Server

```bash
# Start the API server
pnpm dev:api
```

## Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# 1. Start Docker containers
docker-compose up -d

# 2. Install API dependencies
cd api && pnpm install

# 3. Generate Prisma client
pnpm db:generate

# 4. Push database schema
pnpm db:push

# 5. Seed the database
pnpm db:seed

# 6. Start the server
pnpm dev
```

## Database Management

### Access pgAdmin (Web Interface)

- URL: http://localhost:5050
- Email: admin@chatbot.com
- Password: admin

### Direct Database Access

```bash
# Connect to PostgreSQL directly
docker exec -it chatbot-postgres psql -U chatbot_user -d chatbot_db
```

### Useful Commands

```bash
# View database schema
pnpm db:studio

# Reset database
pnpm db:push --force-reset

# Run migrations (if using migrations instead of db:push)
pnpm db:migrate

# Seed database
pnpm db:seed
```

## Database Schema

The database includes the following models:

- **Conversation**: Stores conversation metadata
- **Message**: Stores individual messages in conversations
- **User**: Stores user information (for future use)

## Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in `docker-compose.yml`
2. **Database connection failed**: Ensure Docker containers are running
3. **Prisma client not generated**: Run `pnpm db:generate`
4. **Schema out of sync**: Run `pnpm db:push`

### Reset Everything

```bash
# Stop and remove containers
docker-compose down -v

# Remove node_modules and reinstall
rm -rf api/node_modules
pnpm install

# Start fresh
docker-compose up -d
cd api && node scripts/setup-db.js
```

## Environment Variables

Required environment variables in `api/.env`:

```env
DATABASE_URL="postgresql://chatbot_user:chatbot_password@localhost:5432/chatbot_db?schema=public"
GROQ_API_KEY="your_groq_api_key_here"
PORT=3001
NODE_ENV=development
```

## API Endpoints

Once set up, the API provides these endpoints:

- `POST /api/chat` - Send a message
- `GET /api/chat` - Get all conversations
- `GET /api/chat/:conversationId` - Get specific conversation
- `DELETE /api/chat/:conversationId` - Clear conversation
- `GET /api/health` - Health check

## Development

### Making Schema Changes

1. Update `api/prisma/schema.prisma`
2. Run `pnpm db:push` to apply changes
3. Update your code to use the new schema

### Adding New Models

1. Add model to `schema.prisma`
2. Run `pnpm db:push`
3. Update your controllers and services
