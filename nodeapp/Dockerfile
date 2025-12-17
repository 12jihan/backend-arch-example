# Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ci for safety)
RUN npm ci

# Copy source code
COPY . .

# Build Typescript
RUN npm run build

# production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependecies only
RUN npm ci --only=production

# copy build files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "dist/index.js"]
