# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy source and prisma schema for build and client generation
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Install dependencies
RUN npm ci

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include Prisma for generate/migrate)
RUN npm ci

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema from builder stage
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5001

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
