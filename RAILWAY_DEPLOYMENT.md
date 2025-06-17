# Railway Deployment Guide for Akashic Campaign Console

## Prerequisites
- GitHub account with the repository
- Railway account (sign up at https://railway.app)
- Custom domain (akashic-intelligence.com)

## Step 1: Deploy to Railway

1. Go to https://railway.app/new
2. Choose "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select the `akashic-campaign-console` repository
5. Railway will automatically detect the configuration

## Step 2: Configure Environment Variables

In your Railway project dashboard, go to the Variables tab and add these environment variables:

```env
# Database (Railway will auto-create PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (Railway will auto-create Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# NextAuth Configuration
NEXTAUTH_URL=https://akashic-intelligence.com
NEXTAUTH_SECRET=<generate-a-secure-random-string>

# OpenAI API
OPENAI_API_KEY=<your-openai-api-key>

# Application Settings
NODE_ENV=production
PORT=3000

# Email Configuration (Optional - for future email features)
EMAIL_FROM=noreply@akashic-intelligence.com
```

### Generate NEXTAUTH_SECRET:
Run this command locally and copy the output:
```bash
openssl rand -base64 32
```

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically inject the DATABASE_URL

## Step 4: Add Redis Cache

1. In your Railway project, click "New Service"
2. Select "Database" → "Add Redis"
3. Railway will automatically inject the REDIS_URL

## Step 5: Configure Custom Domain

1. In your Railway project, go to Settings → Networking
2. Click "Generate Domain" to get a temporary Railway domain
3. Click "Add Custom Domain"
4. Enter: `akashic-intelligence.com`
5. Railway will provide DNS records to add

### DNS Configuration:
Add these records to your domain registrar:

**Option A - Root Domain (Recommended):**
- Type: A
- Name: @
- Value: [Railway will provide the IP]

**Option B - CNAME (if your registrar supports CNAME flattening):**
- Type: CNAME
- Name: @
- Value: [Railway will provide the target]

**For www subdomain:**
- Type: CNAME
- Name: www
- Value: akashic-intelligence.com

## Step 6: Deploy

1. Railway will automatically deploy when you push to the main branch
2. Monitor the deployment in the Railway dashboard
3. Check build logs for any errors

## Step 7: Post-Deployment Setup

1. Once deployed, visit your domain
2. The database migrations will run automatically on first deploy
3. Create your admin account:
   - Email: your-email@domain.com
   - Set a secure password

## Step 8: Verify Deployment

Test these endpoints:
- https://akashic-intelligence.com (main app)
- https://akashic-intelligence.com/api/health (health check)

## Monitoring & Logs

1. View logs in Railway dashboard → Deployments → View Logs
2. Set up monitoring alerts in Railway → Settings → Notifications

## Automatic Deployments

Railway automatically deploys when you push to GitHub:
- Push to `main` branch → Production deployment
- Create pull requests for staging/preview deployments

## SSL/TLS

Railway automatically provisions and manages SSL certificates for your custom domain.

## Scaling

In Railway dashboard → Settings:
- Adjust CPU and Memory as needed
- Enable horizontal scaling if required

## Backup Strategy

1. Railway automatically backs up PostgreSQL
2. For additional backups, use the provided backup scripts:
   ```bash
   npm run db:backup
   ```

## Troubleshooting

### Build Failures
- Check build logs in Railway dashboard
- Ensure all environment variables are set
- Verify Prisma schema is valid

### Database Connection Issues
- Verify DATABASE_URL is correctly set
- Check if migrations ran successfully
- Use Railway's database dashboard to inspect

### Domain Not Working
- DNS propagation can take up to 48 hours
- Verify DNS records are correctly set
- Check Railway's domain settings for SSL status

## Cost Estimation

Railway pricing (as of 2024):
- Hobby Plan: $5/month (includes $5 of usage)
- Usage-based pricing after credits
- PostgreSQL: ~$5-10/month for small instances
- Redis: ~$5/month for small instances

Total estimated cost: $15-25/month for a small production deployment

## Support

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Our GitHub Issues: https://github.com/kentontilford/akashic-campaign-console/issues