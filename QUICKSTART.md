# Quick Start Guide

Get PT Tracker running in 5 minutes.

## Prerequisites

- Node.js 20+
- pnpm 8+ (`npm install -g pnpm`)
- PostgreSQL database

## 1. Install Dependencies

```bash
cd PTTracker
pnpm install
```

## 2. Set Up Database

### Option A: Local PostgreSQL

```bash
# Create database
createdb pttracker

# Configure .env
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:
```bash
DATABASE_URL=postgresql://localhost:5432/pttracker
JWT_SECRET=my-secret-key-change-in-production
JWT_REFRESH_SECRET=my-refresh-secret-change-in-production
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Option B: Railway/Neon/Supabase

Sign up for free PostgreSQL at:
- [Railway](https://railway.app)
- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)

Copy the connection string to `DATABASE_URL`.

## 3. Run Migrations

```bash
pnpm db:migrate
```

## 4. Configure Frontend

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 5. Start Development

```bash
# Starts both frontend and backend
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 6. Create Demo Data (Optional)

```bash
cd apps/api
pnpm ts-node src/seed.ts
```

Demo account:
- Email: `demo@pttracker.com`
- Password: `demo123`

## 7. Start Using

1. Open http://localhost:3000
2. Register a new account or use demo account
3. Create your first task!

## Features to Try

### Planning Modes
1. Switch between Weekly/Monthly/Range at the top
2. Tasks show up based on their planning mode

### Create Task
1. Click the + button (bottom right)
2. Fill in title, description, difficulty, desire
3. Task is saved locally (works offline!)

### Recurring Tasks
- Create a task with recurrence rules
- Set it to occur >1/week to see it in the special section

### Dark Mode
1. Go to Settings tab
2. Toggle between Light/Dark/System

### Language
1. Settings → Language
2. Switch to Russian (Русский)

### Analytics
1. Complete some tasks
2. Go to Analytics tab
3. See charts and insights

### Offline Mode
1. Turn off network (airplane mode)
2. App still works!
3. Turn network back on → auto-syncs

## Troubleshooting

### Port Already in Use

```bash
# Change ports in .env files
# Frontend: Change dev port in package.json
# Backend: Change PORT in apps/api/.env
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string
psql $DATABASE_URL
```

### Dependencies Not Found

```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Clean build artifacts
pnpm clean

# Rebuild shared package
cd packages/shared
pnpm build
```

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEPLOY.md](./DEPLOY.md) for deployment guide
- Customize the app to your needs
- Add your own categories
- Set up email provider for magic links

## Development Tips

### Watch Logs

```bash
# Backend logs
cd apps/api
pnpm dev

# Frontend logs
cd apps/web
pnpm dev
```

### Database Studio

```bash
pnpm db:studio
```

Opens Prisma Studio at http://localhost:5555

### Reset Database

```bash
pnpm --filter @pt/api prisma migrate reset
```

## Common Tasks

### Add New Migration

```bash
# 1. Edit apps/api/prisma/schema.prisma
# 2. Create migration
pnpm db:migrate

# 3. Restart dev server
```

### Update Shared Types

```bash
# 1. Edit packages/shared/src/types/*.ts
# 2. Rebuild
cd packages/shared
pnpm build

# 3. Restart servers
```

### Clear Local Data

In browser DevTools:
1. Application → Storage
2. Clear site data

Or use Settings → Reset Local Cache

---

Enjoy using PT Tracker! 🎉
