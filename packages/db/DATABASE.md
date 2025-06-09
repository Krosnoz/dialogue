# @dialogue/db

Database package for the Dialogue application using Drizzle ORM with PostgreSQL and Neon.

## Overview

This package provides:
- Database schema definitions
- Database connection setup
- Type-safe database operations
- Migration management
- Development utilities

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Environment setup:**
   ```bash
   bun run init  # Copies .env.example to .env
   ```

3. **Configure environment variables:**
   ```bash
   DATABASE_URL=your_database_url_here
   NEON_API_KEY=your_neon_api_key  # For branch management
   NEON_PROJECT_ID=your_project_id  # For branch management
   ```

## Database Schema

The database includes the following main entities:

### User Management
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens

### Subscriptions & Billing
- `subscription` - User subscriptions
- `plan` - Available subscription plans
- `usage` - Usage tracking per period
- `usage_event` - Individual usage events

### Core Application
- `project` - User projects
- `conversation` - Project conversations
- `message` - Conversation messages with vector embeddings

## Available Scripts

### Database Operations
```bash
# Generate migrations from schema changes
bun db:generate

# Push schema changes to database
bun db:push

# Open Drizzle Studio (database GUI)
bun db:studio

# Reset database (destructive)
bun db:reset
```

### Development Branch Management
```bash
# Create development branch
bun db:branch create

# List development branches
bun db:branch list

# Delete development branch
bun db:branch delete

# Clean up all development branches
bun db:branch cleanup
```

## Usage

### Basic Database Connection
```typescript
import { db } from "@dialogue/db";
import { user } from "@dialogue/db/schema";

const users = await db.select().from(user);

await db.insert(user).values({
  id: "user_123",
  name: "John Doe",
  email: "john@example.com"
});
```

### Using Exported Utilities
```typescript
import { db, eq, desc, and } from "@dialogue/db";
import { message, conversation } from "@dialogue/db/schema";

const messages = await db
  .select()
  .from(message)
  .where(eq(message.conversationId, conversationId))
  .orderBy(desc(message.createdAt));
```

### Vector Search (Embeddings)
```typescript
import { db, cosineDistance, sql } from "@dialogue/db";
import { message } from "@dialogue/db/schema";
  
const similarMessages = await db
  .select()
  .from(message)
  .where(sql`${message.embedding} IS NOT NULL`)
  .orderBy(cosineDistance(message.embedding, queryEmbedding))
  .limit(10);
```

## Schema Types

All schema tables export TypeScript types:

```typescript
import type {
  UserTypeSelect,
  ProjectTypeSelect,
  MessageTypeSelect,
  ConversationTypeSelect
} from "@dialogue/db/schema";
```

## Development

### Adding New Tables
1. Create/modify schema files in `schema/`
2. Export from `schema/index.ts`
3. Generate migration: `bun db:generate`
4. Apply migration: `bun db:push`

### Custom Migrations
For complex migrations, create SQL files in `migrations/` directory.

## Production Considerations

- Always run migrations in production before deploying code changes
- Use connection pooling for high-traffic applications
- Monitor database performance and query patterns
- Regular backups are handled by Neon automatically

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` is correctly set
- Ensure database is accessible from your environment
- Check Neon dashboard for database status

### Migration Issues
- Review generated migrations before applying
- Test migrations on development branches first
- Keep migrations small and focused

### Type Issues
- Run `bun run check-types` to verify TypeScript compilation
- Regenerate types after schema changes 