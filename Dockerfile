# =======================================================
# BOOSTUP Game Top-up Platform - Production Dockerfile
# Multi-stage build for optimal image size & performance
# =======================================================

# 1. Builder Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build client production bundle
RUN npm run build

# 2. Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server backend
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/server ./server
COPY --from=builder /app/.env.example ./.env.example

# Create persistence directories
RUN mkdir -p server/data server/uploads

# Expose standard web port
EXPOSE 5000

# Healthcheck for container orchestrators (Docker Swarm, Kubernetes, Coolify)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the unified backend & frontend server
CMD ["node", "server/index.js"]
