# Neon Database Branching Workflow

This document outlines the database branching strategy that aligns with your Git workflow.

## Overview

- **Main Git branch** → `main` Neon branch
- **Dev Git branch** → `dev` Neon branch  
- **PR branches** → `preview/pr-{number}-{branch}` Neon branches (via GitHub Actions)
- **Local feature branches** → `local/{branch-name}` Neon branches (via CLI commands)

## Environment Setup

1. Ensure you have the required environment variables:
   ```bash
   NEON_API_KEY=your_api_key_here
   NEON_PROJECT_ID=your_project_id_here
   ```

## Daily Workflow

### Starting Work on a New Feature

1. **Create a Git branch:**
   ```bash
   git checkout -b feature/user-auth
   ```

2. **Set up the database environment:**
   ```bash
   bun db:branch create
   ```

### Alternative: Manual Steps

If you prefer more control:

```bash
# 1. Create a Neon branch
bun db:branch create

# 2. Run migrations
bun db:migrate

# 3. Optional: Reset and seed
bun db:reset-seed
```

### Working with Branches

```bash
# List all local Neon branches
bun db:branch list

# Create a branch for a specific name
bun db:branch create feature/payments

# Delete a specific branch
bun db:branch delete feature/auth

# Clean up all local branches
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
   # Git hook will suggest creating a branch if needed
   ```

## Advanced Usage

### Custom Branch Names
```bash
# Create a branch with a specific name
bun db:setup --branch=experiment/new-schema

# Reset without seeding
bun db:setup --reset

# Just reset existing database
bun db:reset
```

### Database Operations
```bash
# Open database studio
bun db:studio

# Generate migrations
bun db:generate

# Push schema changes
bun db:push
```

## Branch Naming Convention

- **Local development:** `local/{git-branch-name}`
- **PR previews:** `preview/pr-{number}-{git-branch-name}`
- **Main branches:** `main`, `dev`

## Best Practices

1. **Always create a Neon branch** for local feature development
2. **Use meaningful branch names** that match your Git branches
3. **Clean up branches** when done to avoid costs
4. **Use the Git hook** for automatic suggestions
5. **Reset databases** when working with sensitive data

## Troubleshooting

### Branch Creation Fails
```bash
# Check your environment variables
echo $NEON_API_KEY
echo $NEON_PROJECT_ID

# Try creating manually
bun db:branch create
```

### Database Connection Issues
1. Verify the `DATABASE_URL` in your `.env` file
2. Ensure the Neon branch is in "ready" state
3. Check that migrations have run successfully

### Clean Up Stuck Branches
```bash
# List all branches (including non-local)
# Use Neon console or API directly for stuck branches

# Emergency cleanup of all local branches
bun db:branch cleanup
```

## GitHub Actions Integration

The existing GitHub workflow automatically:
- Creates preview branches for PRs
- Runs migrations on preview branches  
- Generates schema diff comments
- Cleans up branches when PRs are closed

No manual intervention needed for PR workflows.

## Cost Optimization

- Local branches use minimal resources
- Auto-cleanup prevents abandoned branches
- Preview branches are automatically managed
- Consider using schema-only branches for structure testing

## Security Notes

- API keys should be stored securely
- Local branches inherit permissions from parent
- Avoid committing sensitive data to any branch
- Use reset functionality to clear test data 