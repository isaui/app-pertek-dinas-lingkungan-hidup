FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG EMAIL_SMTP_HOST
ARG EMAIL_SMTP_PORT
ARG EMAIL_SMTP_SECURE
ARG EMAIL_SMTP_USER
ARG EMAIL_SMTP_PASSWORD
ARG EMAIL_SMTP_REJECT_UNAUTHORIZED
ARG EMAIL_FROM
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG FRONTEND_URL
ARG MINIO_ENDPOINT
ARG MINIO_PORT
ARG MINIO_USE_SSL
ARG MINIO_ACCESS_KEY
ARG MINIO_SECRET_KEY
ARG MINIO_BUCKET_NAME
ARG DATABASE_URL

# Set environment variables
ENV EMAIL_SMTP_HOST=${EMAIL_SMTP_HOST}
ENV EMAIL_SMTP_PORT=${EMAIL_SMTP_PORT}
ENV EMAIL_SMTP_SECURE=${EMAIL_SMTP_SECURE}
ENV EMAIL_SMTP_USER=${EMAIL_SMTP_USER}
ENV EMAIL_SMTP_PASSWORD=${EMAIL_SMTP_PASSWORD}
ENV EMAIL_SMTP_REJECT_UNAUTHORIZED=${EMAIL_SMTP_REJECT_UNAUTHORIZED}
ENV EMAIL_FROM=${EMAIL_FROM}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV FRONTEND_URL=${FRONTEND_URL}
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}
ENV MINIO_PORT=${MINIO_PORT}
ENV MINIO_USE_SSL=${MINIO_USE_SSL}
ENV MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
ENV MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
ENV MINIO_BUCKET_NAME=${MINIO_BUCKET_NAME}
ENV DATABASE_URL=${DATABASE_URL}

# Set environment variables for Prisma
ENV NODE_ENV=production

# Generate Prisma client with explicit binary engine type
RUN npx prisma generate

# Build the application with workaround for Prisma+Nuxt issue
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/nuxt.config.ts ./

# Expose the port
EXPOSE 3000

# Run the application
CMD ["node", ".output/server/index.mjs"]
