# Deployment Checklist for Akashic Campaign Console

## Pre-Deployment Checklist

### Environment Variables (Required)
- [ ] `DATABASE_URL` - PostgreSQL connection string (must start with `postgresql://`)
- [ ] `NEXTAUTH_SECRET` - Authentication secret (minimum 32 characters)
- [ ] `NEXTAUTH_URL` - Your application URL (e.g., `https://your-app.railway.app`)
- [ ] `OPENAI_API_KEY` - OpenAI API key for AI features

### Environment Variables (Optional)
- [ ] `REDIS_URL` - Redis connection string (falls back to in-memory cache if not provided)
- [ ] `EMAIL_FROM` - Sender email address
- [ ] `SENDGRID_API_KEY` - SendGrid API key for email notifications
- [ ] `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` - Facebook integration
- [ ] `TWITTER_API_KEY` / `TWITTER_API_SECRET` - Twitter integration

### Build-Time Environment Variables
- [ ] `SKIP_ENV_VALIDATION=1` - Set during build to skip environment validation
- [ ] `NODE_ENV=production` - Set for production builds

## Railway Deployment Steps

### 1. Initial Setup
```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project (or link existing)
railway init
```

### 2. Add Services
```bash
# Add PostgreSQL
railway add postgresql

# Add Redis (optional)
railway add redis
```

### 3. Set Environment Variables
```bash
# Set required variables
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set SKIP_ENV_VALIDATION=1
```

### 4. Deploy
```bash
# Deploy to Railway
railway up

# Or use GitHub integration for automatic deployments
```

### 5. Post-Deployment

#### Initialize Database Schema
```bash
# Option 1: Run migrations (if you have migration files)
railway run npm run prisma:migrate:deploy

# Option 2: Push schema directly (for initial setup)
railway run npm run prisma:push

# Seed database with demo data (optional)
railway run npm run prisma:seed
```

#### Verify Deployment
- [ ] Check health endpoint: `https://your-app.railway.app/api/health-simple`
- [ ] Check full health: `https://your-app.railway.app/api/health`
- [ ] Test login functionality
- [ ] Verify AI features are working

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
   - Check Railway PostgreSQL plugin is properly linked
   - Ensure database is accessible from deployment

2. **Build Failures**
   - Set `SKIP_ENV_VALIDATION=1` during build
   - Check Node.js version matches (20.x)
   - Verify all dependencies are in package.json

3. **Health Check Failures**
   - Application has 60-second startup grace period
   - Check logs: `railway logs`
   - Verify all required environment variables are set

4. **Memory Issues**
   - Dockerfile sets Node.js memory limit to 512MB
   - Monitor memory usage in Railway dashboard
   - Scale up if needed

### Useful Commands

```bash
# View logs
railway logs

# Open Railway dashboard
railway open

# Run commands in production
railway run [command]

# Check environment variables
railway variables

# Restart deployment
railway restart
```

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is unique and secure (32+ characters)
- [ ] Database uses SSL connection
- [ ] Rate limiting is enabled (or explicitly disabled via `DISABLE_RATE_LIMITING`)
- [ ] All API keys are kept secure and not committed to repository
- [ ] Production logs don't expose sensitive information

## Performance Optimization

- [ ] Redis is configured for caching (optional but recommended)
- [ ] Health check endpoint is configured in railway.json
- [ ] Proper restart policy is set (ON_FAILURE with 3 retries)
- [ ] Memory limits are configured appropriately

## Monitoring

- [ ] Set up error tracking (Sentry is pre-configured)
- [ ] Monitor health check endpoint
- [ ] Set up alerts for failures
- [ ] Track performance metrics

## Final Verification

- [ ] All required environment variables are set
- [ ] Database schema is initialized
- [ ] Application is accessible via HTTPS
- [ ] Authentication is working
- [ ] AI features are functional
- [ ] Health checks are passing

## Rollback Plan

If deployment fails:
1. Check deployment logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Roll back to previous deployment in Railway dashboard
4. Fix issues locally and test thoroughly
5. Redeploy with fixes

## Notes

- The application uses a custom server.js for better error handling
- Redis is optional - the app falls back to in-memory caching
- Database migrations use a fallback to `db push` if migrations fail
- Health checks have a startup grace period to prevent false failures
- Rate limiting can be disabled with `DISABLE_RATE_LIMITING=true`