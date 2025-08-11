# Puskesmas Backend - Fly.io Deployment

## Prerequisites

1. ✅ Install Fly CLI: `irm https://fly.io/install.ps1 | iex`
2. ✅ Sign up/Login: `fly auth signup` or `fly auth login`
3. ✅ Add payment method (for verification only - free tier remains free)
4. ⏳ Complete account verification: https://fly.io/high-risk-unlock

## Current Status

- ✅ Fly CLI installed (v0.3.168)
- ✅ Logged in as: ikhlasabdillah@student.uir.ac.id
- ✅ Payment method added
- ⏳ **Waiting for account verification** - Complete at: https://fly.io/high-risk-unlock

## After Verification Complete:

### Quick Deploy

```bash
# Navigate to backend folder
cd backend

# Initialize (retry after verification)
fly launch --no-deploy

# Set all secrets at once (use fly-secrets.sh commands)
# Or set individually:
fly secrets set NODE_ENV="production"
fly secrets set DB_URI="mongodb+srv://puskesmaspandau:..."
fly secrets set CLOUD_NAME="dopnczizq"
# ... (see fly-secrets.sh for complete list)

# Deploy
fly deploy

# Check status
fly status
fly logs
```

## Configuration Files Created:

- ✅ `fly.toml` - Fly.io configuration
- ✅ `Dockerfile` - Container configuration
- ✅ `.dockerignore` - Build optimization

## Features:

- 🌍 Singapore region (lowest latency to Indonesia)
- 🔄 Always-on (no sleep mode)
- 🔒 Health checks on `/health` endpoint
- 🛡️ Security optimized Docker image
- 📊 256MB RAM (sufficient for Node.js API)

## Free Tier Limits:

- 3 VMs x 256MB RAM
- 160GB bandwidth/month
- Always-on service

## Removed Render configurations:

- ❌ `render.yaml` - deleted
- ❌ `postinstall` script - removed from package.json
