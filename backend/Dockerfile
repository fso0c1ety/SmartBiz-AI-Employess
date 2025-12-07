# Build stage
FROM node:18-slim as builder

WORKDIR /app

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY backend/package*.json ./

# Copy source and prisma schema for build and client generation
COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma
COPY backend/src ./src

# Install dependencies
RUN npm ci

# Generate Prisma client in builder stage
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY backend/package*.json ./

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema from builder stage
COPY --from=builder /app/prisma ./prisma

# Copy ALL node_modules from builder (includes generated Prisma engines)
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 5001

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
