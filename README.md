# Dialogue - AI-Powered Chat Application

A modern, production-ready AI chat application built for [Cloneathon](https://cloneathon.t3.chat/). Dialogue provides a seamless interface for interacting with multiple AI providers (OpenAI, Anthropic, Google) with project-based conversation organization, and real-time streaming.

## 🎯 What is Dialogue?

Dialogue is a sophisticated chat application that allows users to:

- **Chat with AI Models**: Interact with multiple AI providers (OpenAI GPT, Anthropic Claude, Google Gemini)
- **Organize Conversations**: Group chats into projects for better organization
- **Real-time Streaming**: Get real-time responses with streaming support
- **Conversation Management**: Rename, delete, and organize your chat history
- **User Authentication**: Secure email & password authentication
- ~~**Vector Search**: Advanced semantic search capabilities with embeddings~~ No time :/
- **Multi-tenant**: Each user has their own isolated workspace

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**: Next.js 15 with TypeScript, TailwindCSS, and shadcn/ui
- **Backend**: Hono server with tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM and vector extensions (Neon)
- **AI Integration**: Vercel AI SDK with multiple provider support
- **Authentication**: Better Auth with email/password
- **Runtime**: Bun for fast development and build
- **Monorepo**: Turborepo for optimized builds and development

### Project Structure

```
dialogue/
├── apps/
│   ├── web/                   # Next.js frontend application
│   └── server/                # Hono backend server
├── packages/
│   ├── api/                   # tRPC API layer
│   ├── auth/                  # Authentication package
│   ├── db/                    # Database layer with Drizzle
│   ├── types/                 # Shared TypeScript types
│   └── docker/                # Docker configuration
```

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

### Core Entities

**Projects** (`project`)
- Relationships: → conversations

**Conversations** (`conversation`)
- Relationships: → messages

**Messages** (`message`)

### Key Features

- **Hierarchical Structure**: Projects → Conversations → Messages
- **AI Provider Agnostic**: Support for multiple AI models and providers
- **Soft Relationships**: Optional project grouping for conversations

## 🚀 Development Setup

### Prerequisites

- **Bun**: Latest version ([install here](https://bun.sh/))
- **PostgreSQL**: With vector extension support
- **Git**: For version control

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd dialogue

# Install dependencies
bun install
```

### 2. Database Configuration

This project uses **Neon PostgreSQL** with branching for development:

#### First-time Setup
1. Create a Neon account and project
2. Follow the [Vector Extension Setup guide](./packages/db/NEON_BRANCHING.md#vector-extension-setup-required)
3. Copy environment variables:

```bash
# Navigate to database package
cd packages/db

# Copy environment file
cp .env.example .env

# Edit .env with your Neon credentials
```

#### Database Commands

```bash
# Push schema to database
bun db:push

# Open database studio UI
bun db:studio

# Create development branch
bun db:branch create

# List all branches
bun db:branch list

# Cleanup unused branches
bun db:branch cleanup

# Reset database (destructive)
bun db:reset
```

### 3. Environment Configuration

Create environment files for each service:

#### API Configuration (`packages/api/.env`)
```env
# AI Provider API Keys (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Database
DATABASE_URL=your_neon_connection_string

# Redis
REDIS_URL=your_redis_url
```

### 4. Start Development

#### Start All Services
```bash
bun dev
```

This starts:
- **Web App**: http://localhost:3001
- **API Server**: http://localhost:3000

#### Start Individual Services
```bash
# Frontend only
bun dev:web

# Backend only
bun dev:server
```

### 5. Verification

1. Open http://localhost:3001
2. Create an account or sign in
3. Start a new conversation
4. Test AI responses (requires valid API keys)

## 📋 Available Scripts

### Development
- `bun dev` - Start all applications
- `bun dev:web` - Frontend only
- `bun dev:server` - Backend only

### Building
- `bun build` - Build all applications
- `bun build:web` - Build frontend
- `bun build:server` - Build backend

### Production
- `bun start` - Start all in production mode
- `bun start:web` - Start frontend
- `bun start:server` - Start backend

### Code Quality
- `bun check` - Run Biome formatting and linting
- `bun check-types` - TypeScript type checking

### Database
- `bun db:push` - Apply schema changes
- `bun db:studio` - Database UI
- `bun db:branch` - Manage database branches

## 🔧 Configuration

### Environment Variables

Key environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API access
- `ANTHROPIC_API_KEY` - Anthropic API access  
- `GOOGLE_API_KEY` - Google AI API access
- `AUTH_SECRET` - Authentication secret key
- `REDIS_URL` - Redis connection (optional)

### Docker Support

Docker configuration is available in `packages/docker/`:

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run quality checks: `bun check && bun check-types`
4. Commit with conventional commit format
5. Create a pull request

## 📜 License

This project is created for Cloneathon. MIT License.