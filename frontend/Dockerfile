<<<<<<< HEAD
FROM node:18-alpine AS builder
=======
# Build stage
FROM node:20-alpine AS builder
>>>>>>> 001-fullstack-todo-app

WORKDIR /app

# Copy package files
<<<<<<< HEAD
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
=======
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
>>>>>>> 001-fullstack-todo-app
COPY . .

# Build the application
RUN npm run build

<<<<<<< HEAD
FROM node:18-alpine AS runner

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy the build output from the previous stage
=======
# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve to serve the static files
RUN npm install -g serve

# Copy the build output from the builder stage
>>>>>>> 001-fullstack-todo-app
COPY --from=builder /app/out ./out

# Expose port
EXPOSE 3000

<<<<<<< HEAD
# Start the application
=======
# Start the static server
>>>>>>> 001-fullstack-todo-app
CMD ["serve", "-s", "out", "-l", "3000"]