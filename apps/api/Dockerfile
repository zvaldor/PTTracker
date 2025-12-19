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
WORKDIR /app/apps/api

ENV NODE_ENV=production

# Copy built artifacts to the working directory
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma

# Copy node_modules - both root (for @pt/shared) and api-specific
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/node_modules ./node_modules

# Create symlink to @pt/shared from local node_modules to root workspace node_modules
# Remove existing @pt/shared if it exists, then create symlink
RUN mkdir -p node_modules/@pt && \
    rm -rf node_modules/@pt/shared && \
    ln -s /app/node_modules/@pt/shared node_modules/@pt/shared

EXPOSE 3001

# Run from /app/apps/api where node_modules contains all dependencies
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
