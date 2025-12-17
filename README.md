# PT Tracker - Personal Tasks Planner

A production-ready mobile-first web application for personal task planning with offline support, built with Next.js, NestJS, and PostgreSQL.

## Features

- **Mobile-First UI**: Optimized for mobile devices with bottom navigation and swipe actions
- **Offline-First**: Full functionality without internet; syncs when online
- **Multi-Mode Planning**: Weekly, Monthly, and Custom Range planning modes
- **Recurring Tasks**: Configurable recurrence rules with visual indicators for frequent tasks (>1/week)
- **Analytics**: Comprehensive insights with charts for completion rates, carryovers, and efficiency
- **i18n Support**: English and Russian languages
- **Dark Mode**: System, light, and dark theme options
- **PWA**: Installable as a progressive web app with offline support
- **Auth**: Email+password and magic link (passwordless) authentication

## Architecture

### Monorepo Structure

```
PTTracker/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
└── packages/
    └── shared/       # Shared TypeScript types
```

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Dexie (IndexedDB)
- Recharts (analytics charts)
- PWA support (next-pwa)

**Backend:**
- NestJS
- Prisma ORM
- PostgreSQL
- JWT authentication
- Email service (abstracted)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL database

### Local Development

1. **Clone and Install**

```bash
cd PTTracker
pnpm install
```

2. **Set up Database**

Create a PostgreSQL database and configure environment variables:

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/pttracker
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
FRONTEND_URL=http://localhost:3000
PORT=3001

# Email configuration (optional for development)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@pttracker.com
```

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. **Run Database Migrations**

```bash
pnpm db:migrate
```

4. **Start Development Servers**

```bash
# Start both web and api in parallel
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Database Management

```bash
# Generate Prisma client
pnpm db:generate

# Create migration
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

## Deployment

### Railway Deployment (Backend)

1. **Prerequisites**
   - Railway account
   - PostgreSQL database (Railway provides this)

2. **Configure Environment Variables**

In Railway, set these environment variables:

```
DATABASE_URL=<railway-postgres-url>
JWT_SECRET=<generate-secure-secret>
JWT_REFRESH_SECRET=<generate-secure-secret>
FRONTEND_URL=<your-frontend-url>
PORT=3001

# Email configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@pttracker.com
```

3. **Deploy**

```bash
# From project root
cd apps/api

# Railway will automatically detect Dockerfile
railway up
```

The Dockerfile will:
- Build the shared package
- Generate Prisma client
- Build the NestJS application
- Run migrations on startup
- Start the server

4. **Verify Deployment**

```bash
railway logs
```

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel

2. **Configure Build Settings**

```
Root Directory: apps/web
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

3. **Environment Variables**

```
NEXT_PUBLIC_API_URL=<your-railway-api-url>
```

4. **Deploy**

Vercel will automatically deploy on push to main branch.

## Data Model

### Planning Modes

Tasks use a unified `planSlot` key system:

- **Weekly**: `weekly:mon`, `weekly:tue`, ..., `weekly:sun`
- **Monthly**: `monthly:1`, `monthly:2`, ..., `monthly:31`
- **Custom Date**: `date:YYYY-MM-DD`

This is stored in `lastPlannedKey` field for efficient querying.

### Task Fields

- **Planning**: `weeklyDay`, `monthlyDay`, `plannedDate`, `lastPlannedKey`
- **Metadata**: `difficulty` (T-shirt or hours), `desire`, `category`
- **Recurring**: `isRecurring`, `recurringRule`, `occurrencePerWeekEstimate`
- **Tracking**: `carryOverCount` (increments when task is moved)

### Recurring Rules

```typescript
{
  type: "weekly" | "monthly" | "intervalDays",
  interval: number,              // e.g., every 2 weeks
  byWeekday?: number[],          // [0-6] for weekly
  byMonthday?: number[],         // [1-31] for monthly
  startDate?: "YYYY-MM-DD",
  endDate?: "YYYY-MM-DD"
}
```

## Offline-First Sync

### How It Works

1. **Local-First**: All data stored in IndexedDB (Dexie)
2. **Dirty Tracking**: Modified tasks marked with `_dirty` flag
3. **Background Sync**: Automatic sync when online
4. **Conflict Resolution**: Last-write-wins strategy
5. **Merge on Login**: Local tasks merged with cloud data

### Sync Flow

```
User Action → IndexedDB Update → Mark Dirty → Background Sync
                                                    ↓
                                              Server Merge
                                                    ↓
                                            Update Local DB
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register with email/password
- `POST /auth/login` - Login with email/password
- `POST /auth/magic-link` - Request magic link
- `GET /auth/magic-verify?token=<token>` - Verify magic link
- `POST /auth/refresh` - Refresh access token

### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/plan/:planSlot` - Get tasks by plan slot
- `GET /tasks/recurring/frequent` - Get recurring tasks (>1/week)
- `GET /tasks/backlog` - Get unplanned tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Settings
- `GET /settings` - Get user settings
- `PUT /settings` - Update settings

### Analytics
- `GET /analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get analytics

### Sync
- `POST /sync` - Bulk sync tasks

## Mobile Features

### Bottom Navigation

Three main tabs:
- Home (task planning)
- Analytics (insights)
- Settings (configuration)

### Swipe Actions

- Tap checkbox: Mark done/undone
- Long press: Show delete action
- Pull to refresh: Sync with server

### PWA Installation

1. Visit site on mobile
2. "Add to Home Screen" prompt
3. Offline functionality enabled
4. Push notifications (when granted)

## Customization

### T-Shirt Sizing

Default: S, M, L, XL

Users can customize labels in Settings:
```json
{
  "S": "Quick",
  "M": "Normal",
  "L": "Long",
  "XL": "Very Long"
}
```

### Hour Presets

Default: [0.5, 1, 2, 4, 8]

Users can add custom values in Settings.

### Week Start Day

- Monday (default)
- Sunday

Affects weekly planning mode.

## Development Tips

### Adding a New Feature

1. Update shared types in `packages/shared/src/types`
2. Update Prisma schema in `apps/api/prisma/schema.prisma`
3. Create migration: `pnpm db:migrate`
4. Update API endpoints in `apps/api/src`
5. Update frontend in `apps/web/src`

### Testing Auth Flow

1. Start both servers
2. Register new user at `/auth/register`
3. Login at `/auth/login`
4. Or request magic link (check console for link)

### Debugging Sync

1. Open browser DevTools → Application → IndexedDB
2. Check `PTTrackerDB` → `tasks` table
3. Look for `_dirty` flag on modified tasks
4. Check Network tab for `/sync` requests

## Troubleshooting

### Database Issues

```bash
# Reset database
pnpm --filter @pt/api prisma migrate reset

# Regenerate client
pnpm db:generate
```

### Build Errors

```bash
# Clean all builds
pnpm clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Sync Not Working

1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` is set
3. Check network tab for API calls
4. Ensure user is authenticated

## Security Considerations

- All passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Magic links expire after 15 minutes
- All API routes protected with JWT guard
- CORS enabled for frontend URL only

## Performance

- IndexedDB for fast local queries
- Virtual scrolling for large task lists (can be added)
- Optimistic UI updates
- Background sync
- Code splitting with Next.js
- Image optimization with next/image

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## Support

For issues and questions:
- Open GitHub issue
- Check documentation
- Review API logs

---

Built with ❤️ using Next.js and NestJS
