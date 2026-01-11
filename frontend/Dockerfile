FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy the build output from the previous stage
COPY --from=builder /app/out ./out

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "out", "-l", "3000"]