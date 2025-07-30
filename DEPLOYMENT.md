# Deployment Guide for Puskesmas Backend

## 🚀 AWS EC2 Deployment

### Prerequisites
- AWS EC2 instance (Ubuntu 20.04 LTS)
- Domain name (optional)
- SSH access to server

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2 tsx

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt install redis-server -y

# Start services
sudo systemctl start mongod && sudo systemctl enable mongod
sudo systemctl start redis-server && sudo systemctl enable redis-server
```

### Step 2: Application Deployment

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/uptpuskesmas-backend.git
cd uptpuskesmas-backend

# Install dependencies
npm ci --only=production

# Create production environment file
cp .env.example .env.production
# Edit .env.production with your production values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save
```

### Step 3: Security & Firewall

```bash
# Setup firewall
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw --force enable

# Optional: Setup Nginx reverse proxy
sudo apt install nginx -y
# Configure Nginx (see nginx.conf.example)
```

## 📋 Required Environment Variables

Copy `.env.example` to `.env.production` and configure:

```env
NODE_ENV=production
PORT=5000
DB_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379

# Strong JWT secrets (generate new ones!)
ACCESS_TOKEN=your_secure_access_token_32chars_minimum
REFRESH_TOKEN=your_secure_refresh_token_32chars_minimum

# Cloudinary configuration
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_SECRET_KEY=your_cloudinary_secret

# CORS origins (your frontend domains)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## ⚡ Recommended AWS EC2 Specs

### For Small-Medium Traffic:
- **Instance**: t3.medium (2 vCPU, 4GB RAM)
- **Storage**: 30GB GP3 SSD
- **Cost**: ~$35-45/month

### For High Traffic:
- **Instance**: t3.large (2 vCPU, 8GB RAM) 
- **Storage**: 50GB GP3 SSD
- **Cost**: ~$67-85/month

## 🔧 Process Management

```bash
# PM2 commands
pm2 list                 # Show all processes
pm2 restart puskesmas-api   # Restart app
pm2 logs puskesmas-api      # View logs
pm2 monit               # Monitor resources
```

## 📊 Monitoring

The application includes:
- Health check endpoint: `GET /health`
- Performance metrics
- Memory usage monitoring
- Error logging with Winston

## 🔒 Security Features

- Rate limiting
- Security headers (Helmet)
- Input validation
- JWT authentication
- CORS protection
- Request size limits
