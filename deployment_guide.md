# Akashic Campaign Console - Complete Deployment Guide

This guide provides step-by-step instructions to deploy the Akashic Campaign Console for beta testing.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Code Fixes Required](#code-fixes-required)
3. [Hosting Service Setup](#hosting-service-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Deployment Steps](#deployment-steps)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Troubleshooting](#troubleshooting)

---

## 1. Pre-Deployment Checklist

### Required Accounts/Services
- [ ] **OpenAI API Key** - Required for AI features (https://platform.openai.com)
- [ ] **PostgreSQL Database** - Can be provided by hosting service
- [ ] **Redis Instance** - Optional but recommended for caching
- [ ] **Domain Name** - For production URL (optional for beta)
- [ ] **SSL Certificate** - Usually provided by hosting service

### Local Prerequisites
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Docker installed (optional but recommended)

---

## 2. Code Fixes Required

Before deployment, apply these critical fixes:

### A. Update Rate Limiting for Production
```bash
# Edit src/middleware.ts
# Change line 72 from:
limit = 20 // Auth endpoints: 20 attempts per 15 minutes (increased for development)
# To:
limit = 10 // Auth endpoints: 10 attempts per 15 minutes
```

### B. Add Missing Environment Example File
Create `.env.example` in the root directory:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/akashic_campaign"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Redis (Optional)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Email (Optional)
EMAIL_FROM="noreply@yourdomain.com"
SENDGRID_API_KEY=""

# Production
NODE_ENV="production"
```

### C. Create Health Check Endpoint
Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'

export async function GET() {
  try {
    // Check database
    await db.$queryRaw`SELECT 1`
    
    // Check Redis if available
    let redisStatus = 'not configured'
    if (redis) {
      await redis.ping()
      redisStatus = 'healthy'
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        redis: redisStatus
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 })
  }
}
```

---

## 3. Hosting Service Setup

### Recommended Option: Railway.app (Easiest for Beta)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub
   - Create new project

2. **Add Services**
   ```
   Click "New" → Add these services:
   - PostgreSQL (automatic setup)
   - Redis (automatic setup)
   - GitHub Repo (your repository)
   ```

3. **Railway Configuration**
   - Railway automatically detects Next.js
   - Uses Nixpacks for building
   - Provides SSL automatically

### Alternative Options

#### A. Vercel + Supabase
- **Pros**: Excellent Next.js support, free tier
- **Cons**: Need external database

#### B. Render.com
- **Pros**: Simple setup, includes databases
- **Cons**: Cold starts on free tier

#### C. VPS (DigitalOcean/Linode)
- **Pros**: Full control, better for production
- **Cons**: More setup required

---

## 4. Environment Configuration

### Generate Required Secrets

1. **Generate NEXTAUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```

2. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create new secret key
   - Save it securely

### Configure Environment Variables

#### For Railway:
1. Go to your service settings
2. Click "Variables"
3. Add each variable:
   ```
   DATABASE_URL = (auto-provided by Railway)
   NEXTAUTH_URL = https://your-app.railway.app
   NEXTAUTH_SECRET = (your generated secret)
   OPENAI_API_KEY = sk-...
   REDIS_URL = (auto-provided by Railway)
   NODE_ENV = production
   ```

#### For Other Platforms:
- Use platform-specific environment configuration
- Ensure all required variables are set

---

## 5. Database Setup

### Automatic Setup (Railway)
Railway provides PostgreSQL automatically with DATABASE_URL.

### Manual Setup (VPS/Other)

1. **Install PostgreSQL**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Create Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE akashic_campaign;
   CREATE USER akashic_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE akashic_campaign TO akashic_user;
   \q
   ```

3. **Update DATABASE_URL**
   ```
   postgresql://akashic_user:secure_password@localhost:5432/akashic_campaign
   ```

---

## 6. Deployment Steps

### Option A: Railway Deployment (Recommended)

1. **Connect Repository**
   ```
   - In Railway, click "Deploy from GitHub repo"
   - Select your repository
   - Choose branch (main or production)
   ```

2. **Configure Build**
   ```
   Railway auto-detects Next.js
   No additional configuration needed
   ```

3. **Deploy**
   ```
   - Click "Deploy"
   - Watch build logs
   - Takes ~5-10 minutes
   ```

4. **Run Migrations**
   ```bash
   # In Railway, go to your service
   # Click "Connect" → "Railway CLI"
   railway run npm run prisma:migrate:deploy
   ```

### Option B: Manual VPS Deployment

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/akashic-campaign-console.git
   cd akashic-campaign-console
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   nano .env
   ```

4. **Build Application**
   ```bash
   npm run prisma:generate
   npm run build
   ```

5. **Run Migrations**
   ```bash
   npm run prisma:migrate:deploy
   ```

6. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "akashic" -- start
   pm2 save
   pm2 startup
   ```

### Option C: Docker Deployment

1. **Build Image**
   ```bash
   docker build -t akashic-campaign-console .
   ```

2. **Run with Docker Compose**
   ```bash
   # Create docker-compose.prod.yml
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 7. Post-Deployment Testing

### Initial Setup

1. **Access Application**
   ```
   https://your-domain.com or https://your-app.railway.app
   ```

2. **Create Admin Account**
   ```
   - Go to /register
   - Create first account (automatically admin)
   ```

3. **Seed Demo Data (Optional)**
   ```bash
   railway run npm run prisma:seed
   # or
   npm run prisma:seed
   ```

### Testing Checklist

- [ ] **Authentication**
  - Can register new account
  - Can login/logout
  - Session persists

- [ ] **Campaign Creation**
  - Create new campaign
  - Add team members
  - Edit campaign details

- [ ] **Message Creation**
  - Create message with AI
  - Version control works
  - Preview different versions

- [ ] **Performance**
  - Pages load quickly
  - No console errors
  - Images load properly

### Health Monitoring

1. **Check Health Endpoint**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Monitor Logs**
   ```bash
   # Railway
   railway logs

   # PM2
   pm2 logs akashic

   # Docker
   docker-compose logs -f
   ```

---

## 8. Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: P1001: Can't reach database server
```
**Solution**: 
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Check firewall rules

#### Build Failures
```
Error: Cannot find module 'X'
```
**Solution**:
- Run `npm install`
- Clear cache: `rm -rf .next node_modules`
- Rebuild: `npm run build`

#### Authentication Not Working
```
Error: NEXTAUTH_URL mismatch
```
**Solution**:
- Ensure NEXTAUTH_URL matches your domain
- Include protocol (https://)
- No trailing slash

#### Rate Limiting Issues
**Solution**:
- Temporarily increase limits in middleware.ts
- Clear rate limit cache (restart server)

### Performance Optimization

1. **Enable Redis Caching**
   ```
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   ```

2. **Configure CDN (Optional)**
   - Use Cloudflare for static assets
   - Enable caching headers

3. **Database Indexes**
   ```sql
   -- Run these for better performance
   CREATE INDEX idx_messages_campaign ON "Message"("campaignId");
   CREATE INDEX idx_versions_message ON "MessageVersion"("messageId");
   ```

---

## Quick Start Commands

### For Railway
```bash
# After connecting repo in Railway dashboard
railway run npm run prisma:migrate:deploy
railway run npm run prisma:seed  # Optional
```

### For VPS/Manual
```bash
# Setup
git clone <your-repo>
cd akashic-campaign-console
npm install
cp .env.example .env
# Edit .env file

# Deploy
npm run prisma:generate
npm run build
npm run prisma:migrate:deploy
npm start
```

### For Docker
```bash
docker build -t akashic .
docker run -p 3000:3000 --env-file .env akashic
```

---

## Support & Monitoring

### Recommended Monitoring Tools
- **Uptime**: UptimeRobot or Pingdom
- **Errors**: Sentry (add SENTRY_DSN to env)
- **Analytics**: Vercel Analytics or Plausible
- **Logs**: LogTail or Papertrail

### Backup Strategy
```bash
# Automated daily backups (add to crontab)
0 2 * * * pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## Beta Testing Guidelines for Simon

1. **Access Credentials**
   - URL: [Will be provided after deployment]
   - Initial Login: Use /register to create account
   - Demo Account: admin@akashic.com / admin123

2. **Key Features to Test**
   - Campaign creation workflow
   - Message versioning system
   - AI content generation
   - Team collaboration features
   - Approval workflows

3. **Feedback Collection**
   - Note any bugs or issues
   - Performance concerns
   - UI/UX improvements
   - Feature requests

4. **Support**
   - Check logs for errors
   - Monitor health endpoint
   - Document any issues encountered

---

This deployment is configured for beta testing with reasonable defaults. For production deployment, additional security hardening and scaling considerations should be implemented.