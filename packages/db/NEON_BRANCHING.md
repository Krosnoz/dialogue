# Neon Database Branching Workflow

This document outlines the database branching strategy using Neon's branching feature that aligns with your Git workflow.

## Initial Repository Setup

**⚠️ Important: Before setting up any branches, you must first configure the vector extension on your main Neon branch.**

### Vector Extension Setup (Required)

1. **Clean up existing branches** (if any):
   - Go to [Neon Console](https://console.neon.tech/)
   - Navigate to your project
   - Delete all existing branches except `main`

2. **Enable vector extension on main branch**:
   - In Neon Console, go to your `main` branch
   - Open the SQL Editor
   - Execute the following command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Create your development branches**:
   - All new branches (dev, local, preview, etc.) will automatically inherit the vector extension
   - You can now safely create branches using the workflow below

**Why this is needed**: The `vector` extension requires superuser privileges to install. Manual installation through Neon's SQL Editor has the necessary permissions, while migration scripts run with limited user privileges. By installing it on the main branch first, all child branches inherit the extension automatically.

## Overview

Neon database branches provide isolated database environments for different stages of development:

- **Main Git branch** → `main` Neon branch (Production)
- **Dev Git branch** → `dev` Neon branch (Staging)  
- **PR branches** → `preview/pr-{number}-{branch}` Neon branches (via GitHub Actions)
- **Local feature branches** → `local/{branch-name}` Neon branches (via CLI commands)

## Environment Setup

Ensure you have the required environment variables in your `.env` files:

```bash
NEON_API_KEY=your_api_key_here
NEON_PROJECT_ID=your_project_id_here
DATABASE_URL=your_database_url_here  # Will be updated automatically
```

## Daily Development Workflow

### Starting Work on a New Feature

1. **Create a Git branch:**
   ```bash
   git checkout -b feature/user-auth
   ```

2. **Create corresponding Neon branch:**
   ```bash
   bun db:branch create
   ```
   
   This automatically:
   - Creates a `local/feature/user-auth` Neon branch
   - Updates all `.env` files with the new `DATABASE_URL`
   - Waits for the branch to be ready

### Working with Existing Branches

```bash
# List all local Neon branches
bun db:branch list

# Create a branch for a specific name (if not current git branch)
bun db:branch create feature/payments

# Delete a specific branch
bun db:branch delete feature/auth

# Clean up all local branches at once
bun db:branch cleanup
```

### When Done with a Feature

1. **Delete the Neon branch:**
   ```bash
   bun db:branch delete feature/user-auth
   ```

2. **Switch back to your main development branch:**
   ```bash
   git checkout dev
   ```

## Branch Naming Convention

- **Local development:** `local/{git-branch-name}`
- **PR previews:** `preview/pr-{number}-{git-branch-name}` (automated)
- **Main branches:** `main`, `dev`

## Advanced Neon Operations

### Manual Branch Management

If you need to work with branches outside the automated workflow:

```bash
# Create branch from specific parent
# (modify the script to accept parent branch parameter)

# Check branch status via Neon Console
# Visit: https://console.neon.tech/app/projects/{PROJECT_ID}/branches
```

### Database Operations on Branches

Once a branch is created and active:

```bash
# Run migrations on the branch
bun db:push

# Open Drizzle Studio for the branch
bun db:studio

# Reset the branch database
bun db:reset
```

## GitHub Actions Integration

The project includes automated workflows that:

- **On PR creation:** Creates `preview/pr-{number}-{branch}` Neon branch
- **On PR updates:** Runs migrations on the preview branch
- **On PR merge/close:** Cleans up the preview branch
- **Schema diff comments:** Automatically posts migration diffs to PRs

No manual intervention needed for PR workflows.

## Best Practices

### Development
1. **Always create a Neon branch** for local feature development
2. **Use meaningful branch names** that match your Git branches
3. **Test migrations** on your branch before merging
4. **Clean up branches** when done to avoid unnecessary costs

### Database Changes
1. **Make schema changes incrementally** - avoid large migrations
2. **Test backwards compatibility** when possible
3. **Use the reset functionality** to test with fresh data
4. **Review generated migrations** before applying

### Cost Management
1. **Delete unused branches promptly** - each branch has storage costs
2. **Use the cleanup command** regularly: `bun db:branch cleanup`
3. **Monitor branch usage** via Neon Console

## Troubleshooting

### Branch Creation Fails
```bash
# Check your environment variables
echo $NEON_API_KEY
echo $NEON_PROJECT_ID

# Verify API key permissions in Neon Console
# Ensure project ID is correct
```

### Database Connection Issues
1. **Check branch status** - ensure it's in "ready" state
2. **Verify DATABASE_URL** in your `.env` files
3. **Wait for endpoint** - new branches need time to initialize
4. **Check network connectivity** to Neon endpoints

### Branch Stuck in Creating State
```bash
# Wait up to 2-3 minutes for branch creation
# Check Neon Console for any error messages
# Try deleting and recreating if stuck

# Emergency cleanup of problematic branches
bun db:branch cleanup
```

### Environment File Issues
```bash
# Manually verify .env files are updated:
# - apps/server/.env
# - packages/auth/.env  
# - packages/db/.env

# All should have the same DATABASE_URL for the active branch
```

## Security Considerations

- **API keys** should be stored securely and not committed to version control
- **Local branches inherit permissions** from the parent branch
- **Avoid committing sensitive data** to any branch
- **Use reset functionality** to clear test data before sharing branches
- **Rotate API keys** periodically for security

## Monitoring and Maintenance

### Regular Tasks
- Review and clean up old branches monthly
- Monitor storage usage in Neon Console
- Update API keys when they expire
- Review branch creation patterns for optimization

### Performance
- Branches share compute resources with the parent
- Monitor query performance across branches
- Use appropriate connection pooling settings
- Consider branch-specific optimizations for testing 