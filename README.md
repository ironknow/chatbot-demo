# 🤖 AI-Powered Chatbot Demo

A full-stack chatbot application powered by Groq's fast LLM models (Llama 3.1), built with React and Node.js.

## ✨ Features

- **Real AI Integration**: Powered by Groq's Llama 3.1 models (FREE!)
- **PostgreSQL Database**: Persistent conversation storage with Prisma ORM
- **Docker Support**: Easy database setup with Docker Compose
- **TypeScript**: Full type safety and better development experience
- **CRACO**: Customizable React app configuration
- **Modular Architecture**: Organized components, hooks, and services
- **Conversation Memory**: Remembers context across messages
- **Modern UI**: Beautiful, responsive chat interface
- **Typing Indicators**: Realistic chat experience
- **Message Timestamps**: Track when messages were sent
- **Error Handling**: Graceful handling of API issues
- **Workspace Management**: Easy development with pnpm workspaces

## 🚀 Quick Start

### Development vs Production

- **Development**: Uses hot reloading for both frontend and backend
  - Frontend: React dev server with hot reload
  - Backend: Nodemon with file watching and auto-restart
- **Production**: Optimized builds and static serving
  - Frontend: Built and served as static files
  - Backend: Node.js server without dev tools

### Prerequisites

- Node.js (v16 or higher)
- pnpm package manager
- Docker and Docker Compose (v2+)
- Groq API key (FREE!)

### Option 1: Quick Start (Recommended)

```bash
# One command setup - installs deps, starts database, configures API
pnpm quick-start

# Then edit your API key and start development
# Edit api/.env with your GROQ_API_KEY
pnpm dev
```

### Option 2: Manual Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Database

```bash
# Start PostgreSQL with Docker
pnpm db:up

# Or use the complete setup
pnpm db:setup
```

### 3. Set Up Groq API Key

Create a `.env` file in the `api` directory:

```bash
cd api
cp env.example .env
```

Edit the `.env` file and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
MAX_TOKENS=500
TEMPERATURE=0.7
```

### 4. Get Groq API Key (FREE!)

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in (it's free!)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

### 5. Start the Application

```bash
# Development - Start both frontend and backend with hot reloading
pnpm dev

# Or start them separately
pnpm dev:api    # Backend with nodemon (hot reload)
pnpm dev:web    # Frontend with React dev server

# Production - Build and serve
pnpm build      # Build frontend
pnpm start      # Start API server (production)
pnpm serve:web  # Serve built frontend

# Database management
pnpm db:up      # Start database
pnpm db:down    # Stop database
pnpm db:status  # Check database status
pnpm db:logs    # View database logs
pnpm db:studio  # Open Prisma Studio
pnpm db:reset   # Reset database (delete all data)

# Other useful commands
pnpm test       # Run all tests
pnpm lint       # Lint all code
pnpm clean      # Clean node_modules
pnpm health     # Check API health
```

### 6. Open the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:5050 (admin@chatbot.com / admin)

## 🛠 Configuration

### TypeScript Features

The frontend is built with TypeScript and includes:

- **Type Safety**: Full type checking for all components and functions
- **Path Mapping**: Clean imports with `@/` aliases
- **Strict Mode**: Enhanced type checking for better code quality
- **Source Maps**: Better debugging experience
- **Modular Structure**: Organized components, hooks, services, and types

### Environment Variables

| Variable       | Description                   | Default                |
| -------------- | ----------------------------- | ---------------------- |
| `GROQ_API_KEY` | Your Groq API key             | Required               |
| `GROQ_MODEL`   | Groq model to use             | `llama-3.1-8b-instant` |
| `MAX_TOKENS`   | Maximum tokens per response   | `500`                  |
| `TEMPERATURE`  | Response creativity (0.0-2.0) | `0.7`                  |

### Available Models (All FREE!)

- `llama-3.1-8b-instant` (recommended, very fast)
- `llama-3.1-70b-versatile` (more capable, slightly slower)
- `mixtral-8x7b-32768` (good balance)

## 📁 Project Structure

```
chatbot-demo/
├── api/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration
│   │   └── app.js         # Express app setup
│   ├── server.js          # Entry point
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
├── web/                   # React frontend (TypeScript + CRACO)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main chat component
│   │   └── App.css        # Styling
│   ├── tsconfig.json      # TypeScript config
│   ├── craco.config.js    # CRACO config
│   └── package.json       # Frontend dependencies
├── package.json           # Workspace configuration
└── pnpm-workspace.yaml    # pnpm workspace config
```

## 🔧 API Endpoints

- `POST /api/chat` - Send a message to the chatbot
- `GET /api/chat` - Get all conversations
- `GET /api/chat/:conversationId` - Get conversation history
- `DELETE /api/chat/:conversationId` - Clear conversation
- `GET /api/health` - Health check and database status

## 💡 Usage Examples

Try asking the chatbot:

- "Hello! What can you help me with?"
- "Explain quantum computing in simple terms"
- "Write a short poem about coding"
- "What's the weather like?" (it will explain it can't check weather)
- "Help me plan a weekend trip"

## 🚨 Troubleshooting

### Common Issues

1. **"I'm not properly configured yet"**
   - Check that your `.env` file exists in the `api` directory
   - Verify your Groq API key is correct
   - Restart the API server after adding the key

2. **Rate limit errors**
   - You've hit Groq's rate limits (very generous free tier)
   - Wait a moment and try again
   - Check your usage in the Groq console

3. **API key invalid**
   - Double-check your API key in the `.env` file
   - Ensure your Groq account is active

4. **CORS errors**
   - Make sure both servers are running
   - Check that the frontend is calling the correct API URL

### Debug Mode

Check the API health endpoint:

```bash
curl http://localhost:5000/api/health
```

## 💰 Cost Considerations

- **Groq Models**: 100% FREE! 🎉
- **No credit card required**
- **Generous rate limits**
- Typical conversation: 100-500 tokens per exchange

## 🔒 Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Consider using environment variables in production

## 🚀 Deployment

For production deployment:

1. Set up environment variables on your hosting platform
2. Build the frontend: `pnpm build:web`
3. Deploy both API and built frontend
4. Consider using a database instead of in-memory storage

## 📝 License

MIT License - feel free to use this project for learning and development!

---

**Happy Chatting! 🤖💬**

# Pre-commit Setup Complete
