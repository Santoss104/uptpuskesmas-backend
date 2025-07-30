#!/bin/bash

# AWS EC2 Deployment Script for Puskesmas Backend

echo "🚀 Starting Puskesmas Backend Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2 tsx

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
echo "📦 Installing Redis..."
sudo apt install redis-server -y

# Start services
echo "🔄 Starting services..."
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Nginx (optional - for reverse proxy)
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Setup firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 5000    # API (temporary)
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/puskesmas-backend
sudo chown -R $USER:$USER /var/www/puskesmas-backend

echo "✅ Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/puskesmas-backend"
echo "2. Copy your .env.production file"
echo "3. Run: npm ci --only=production"
echo "4. Run: pm2 start ecosystem.config.js --env production"
echo "5. Run: pm2 startup && pm2 save"
