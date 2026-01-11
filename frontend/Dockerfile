# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve to serve the static files
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/out ./out

# Expose port
EXPOSE 3000

# Start the static server
CMD ["serve", "-s", "out", "-l", "3000"]