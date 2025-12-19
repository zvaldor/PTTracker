FROM node:20-alpine AS base

# Install OpenSSL (required for Prisma)
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

# Stage 1: Dependencies
FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install ALL dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build API
WORKDIR /app/apps/api
RUN pnpm prisma:generate
RUN pnpm build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma

# Copy the ENTIRE node_modules from builder (includes everything: deps, prisma client, @pt/shared)
# This is larger but much simpler and more reliable
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3001

# Use the locally installed prisma version (5.7.1) from apps/api/node_modules
# In pnpm, binaries are in the scoped package location
CMD ["sh", "-c", "./apps/api/node_modules/.bin/prisma migrate deploy && node dist/main"]
