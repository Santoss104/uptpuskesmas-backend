#!/bin/bash

echo "🚀 Deploying Puskesmas Backend to AWS..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build TypeScript (if needed)
echo "🔨 Building application..."
npm run build 2>/dev/null || echo "No build script found"

# Restart PM2
echo "♻️ Restarting application..."
pm2 restart puskesmas-backend

# Check status
echo "✅ Checking application status..."
pm2 status

echo "🎉 Deployment completed!"
echo "🌐 Check your app at: https://your-domain.com"
