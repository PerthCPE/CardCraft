# ============================================================================
# CardCraft Backend — Production Multi-stage Dockerfile
# Optimized for Render, Railway, Fly.io, or VPS Deployment
# ============================================================================

# Step 1: Dependencies & Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build NestJS
COPY . .
RUN npm run build

# Remove development dependencies to keep image lean
RUN npm prune --production

# Step 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN apk add --no-cache openssl

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# Run Prisma schema push on startup and launch NestJS production server
CMD ["sh", "-c", "npx prisma db push && node dist/main"]
