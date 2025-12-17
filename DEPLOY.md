# Deployment Guide

Complete guide to deploy PT Tracker to production.

## Railway (Backend API)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

### Step 2: Add PostgreSQL

1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically provision a database
3. Note the `DATABASE_URL` in variables

### Step 3: Configure Environment Variables

In Railway dashboard, add these variables:

```bash
# Database (auto-populated by Railway)
DATABASE_URL=postgresql://...

# JWT Secrets (generate secure random strings)
JWT_SECRET=<use-a-long-random-string-here>
JWT_REFRESH_SECRET=<use-a-different-long-random-string>

# Frontend URL (update after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app

# Port
PORT=3001

# Email Provider (choose one)
EMAIL_PROVIDER=smtp

# Option 1: SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@pttracker.com

# Option 2: SendGrid (alternative)
# EMAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=<your-api-key>

# Option 3: Mailgun (alternative)
# EMAIL_PROVIDER=mailgun
# MAILGUN_API_KEY=<your-api-key>
# MAILGUN_DOMAIN=<your-domain>
```

### Step 4: Configure Build Settings

Railway should auto-detect the Dockerfile. If not:

1. Settings → Build
2. Builder: Dockerfile
3. Dockerfile Path: `apps/api/Dockerfile`
4. Root Directory: `/`

### Step 5: Deploy

1. Click "Deploy"
2. Railway will build and deploy
3. Monitor logs for any errors
4. Note the public URL (e.g., `https://your-api.railway.app`)

### Step 6: Verify Deployment

```bash
# Test API health
curl https://your-api.railway.app

# Check migrations ran
# Look in logs for "Migration applied successfully"
```

### Generating Secure Secrets

```bash
# On Mac/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Vercel (Frontend)

### Step 1: Prepare Repository

Ensure code is pushed to GitHub/GitLab/Bitbucket.

### Step 2: Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your git repository
4. Select the repo

### Step 3: Configure Build Settings

```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: cd ../.. && pnpm install && cd apps/web && pnpm build
Output Directory: .next
Install Command: pnpm install --no-frozen-lockfile
Development Command: pnpm dev
```

**Important:** Vercel needs to install dependencies from the root to resolve workspace packages.

### Step 4: Environment Variables

Add in Vercel dashboard:

```bash
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note the production URL

### Step 6: Update Backend CORS

Go back to Railway and update `FRONTEND_URL`:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

Redeploy the backend for CORS to update.

## Post-Deployment Setup

### 1. Create Admin User

Option A: Via API:
```bash
curl -X POST https://your-api.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123"}'
```

Option B: Via Frontend:
1. Visit https://your-app.vercel.app/auth/register
2. Create account

### 2. Test Magic Link

1. Request magic link at `/auth/login`
2. Check email logs in Railway
3. Copy the link from logs (if email not configured)
4. Paste in browser to verify

### 3. Configure Email (Production)

**SendGrid:**
1. Sign up at sendgrid.com
2. Create API key
3. Add to Railway env vars:
```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com
```

**Mailgun:**
1. Sign up at mailgun.com
2. Get API key and domain
3. Add to Railway:
```bash
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=<key>
MAILGUN_DOMAIN=<domain>
EMAIL_FROM=noreply@yourdomain.com
```

### 4. Enable PWA

1. Visit your app on mobile
2. Browser will prompt "Add to Home Screen"
3. Icon appears on home screen
4. App works offline

### 5. Set Up Custom Domain (Optional)

**Railway:**
1. Settings → Domains
2. Add custom domain
3. Update DNS records

**Vercel:**
1. Settings → Domains
2. Add custom domain
3. Vercel provides DNS instructions

## Monitoring

### Railway Logs

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# View logs
railway logs
```

### Vercel Logs

1. Go to project dashboard
2. Click on deployment
3. View Function Logs

### Database Monitoring

Railway provides:
- CPU/Memory usage
- Connection count
- Query performance

Access via:
1. Railway dashboard
2. Click PostgreSQL service
3. Metrics tab

## Backup Strategy

### Database Backups

Railway auto-backs up PostgreSQL. To manually backup:

```bash
# Get DATABASE_URL from Railway
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Automated Backups

Use Railway's built-in backups:
1. PostgreSQL service → Backups
2. Configure schedule
3. Download backups as needed

## Scaling

### Railway

- Pro plan supports:
  - Multiple replicas
  - Autoscaling
  - More resources

Configuration:
1. Service → Settings
2. Number of Replicas
3. Auto-scaling rules

### Vercel

- Automatically scales
- Serverless functions
- Edge caching
- No configuration needed

## Troubleshooting

### Build Fails on Railway

Check logs:
```bash
railway logs --service api
```

Common issues:
- Missing environment variables
- Prisma migration errors
- Out of memory (upgrade plan)

Solution:
```bash
# Verify Dockerfile builds locally
docker build -f apps/api/Dockerfile .
```

### Frontend Can't Connect to API

1. Check `NEXT_PUBLIC_API_URL` in Vercel
2. Verify CORS settings in Railway
3. Check browser console for errors
4. Test API directly:
```bash
curl https://your-api.railway.app/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Database Connection Errors

1. Verify `DATABASE_URL` in Railway
2. Check connection limit
3. Restart service
4. Review Prisma logs

### Email Not Sending

1. Check email provider credentials
2. Review Railway logs for email errors
3. Test with console logging:
```bash
# Temporarily set
EMAIL_PROVIDER=console
```

## Performance Optimization

### Backend

1. **Connection Pooling:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling
  // connection_limit = 10
}
```

2. **Caching:**
Add Redis for session caching (Railway provides Redis addon)

3. **Indexing:**
Already configured in Prisma schema for common queries

### Frontend

1. **Image Optimization:**
- Use `next/image`
- Optimize icon files

2. **Code Splitting:**
- Already done by Next.js
- Add dynamic imports for heavy components

3. **Service Worker:**
- Already configured via next-pwa
- Customize in `next.config.js`

## Security Checklist

- [ ] Change default JWT secrets
- [ ] Enable HTTPS only (done by Railway/Vercel)
- [ ] Set strong CORS policy
- [ ] Enable rate limiting (add middleware)
- [ ] Regular dependency updates
- [ ] Monitor for security vulnerabilities
- [ ] Secure email credentials
- [ ] Use environment variables (never commit secrets)

## Cost Estimates

### Railway (API + Database)

- Hobby: $5/month (500 hours)
- Pro: $20/month (unlimited)

### Vercel (Frontend)

- Hobby: Free (personal projects)
- Pro: $20/month (commercial)

### Email

- SendGrid: Free tier (100 emails/day)
- Mailgun: Free tier (5000 emails/month)

**Total:** $0-$40/month depending on usage

## Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- NestJS: [docs.nestjs.com](https://docs.nestjs.com)

---

Happy deploying! 🚀
