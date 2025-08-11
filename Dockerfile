# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including tsx for TypeScript execution)
RUN npm ci

# Copy source code
COPY . .

# Expose port (Fly.io will set PORT env var)
EXPOSE 8080

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Start the application with Node.js tsx loader
CMD ["npm", "start"]
