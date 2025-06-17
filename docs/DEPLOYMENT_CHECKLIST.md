# Deployment Checklist for Beta Testing

## Pre-Deployment Setup

### 1. Environment Configuration
- [ ] Create `.env.production` file with:
  ```env
  DATABASE_URL=postgresql://user:password@host:5432/akashic_beta
  NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
  NEXTAUTH_URL=https://beta.akashic.com
  OPENAI_API_KEY=sk-...
  REDIS_URL=redis://localhost:6379 (optional)
  ```

### 2. Database Setup
- [ ] Create PostgreSQL database
- [ ] Run migrations:
  ```bash
  npm run prisma:migrate deploy
  ```
- [ ] Run seed script:
  ```bash
  npm run prisma:seed
  ```

### 3. Data Import
- [ ] Prepare election data files
- [ ] Run import script:
  ```bash
  npx tsx scripts/import-election-data.ts
  ```
- [ ] Verify data imported correctly

### 4. Beta User Setup
- [ ] Run beta user creation:
  ```bash
  npx tsx scripts/setup-beta-users.ts
  ```
- [ ] Document credentials securely

### 5. Build & Deploy
- [ ] Build application:
  ```bash
  npm run build
  ```
- [ ] Test build locally:
  ```bash
  npm start
  ```

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Traditional VPS
1. SSH to server
2. Clone repository
3. Install dependencies
4. Configure environment
5. Build and run with PM2:
   ```bash
   pm2 start npm --name "akashic-beta" -- start
   ```

## Post-Deployment Verification

### 1. System Health Check
- [ ] Run health check:
  ```bash
  npx tsx scripts/system-health-check.ts
  ```

### 2. Feature Testing
- [ ] Login page accessible
- [ ] Can login with beta credentials
- [ ] Dashboard loads
- [ ] Election mapping works
- [ ] Message creation works
- [ ] No console errors

### 3. Performance Check
- [ ] Page load time < 3s
- [ ] API responses < 1s
- [ ] Map renders smoothly

### 4. Security Review
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Database credentials protected
- [ ] CORS configured properly

## Monitoring Setup

### 1. Application Logs
- [ ] Set up log aggregation (Papertrail, Loggly, etc.)
- [ ] Configure error tracking (Sentry)

### 2. Performance Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure performance tracking
- [ ] Set up alerts for errors

### 3. Database Monitoring
- [ ] Monitor connection pool
- [ ] Track slow queries
- [ ] Set up backup schedule

## Beta Testing Communication

### 1. Send to Testers
- [ ] Beta Testing Guide
- [ ] Login credentials (securely)
- [ ] Feedback submission process
- [ ] Timeline and expectations

### 2. Create Feedback Channel
- [ ] Set up feedback email/form
- [ ] Create issue tracking system
- [ ] Schedule check-in meetings

### 3. Prepare for Feedback
- [ ] Issue template ready
- [ ] Priority system defined
- [ ] Response process established

## Emergency Procedures

### If Something Goes Wrong:
1. **Application Down**:
   - Check server logs
   - Verify database connection
   - Restart application

2. **Data Issues**:
   - Have backup ready
   - Know rollback procedure
   - Document any data fixes

3. **Performance Problems**:
   - Check Redis status
   - Monitor database load
   - Scale resources if needed

## Success Metrics

Track these during beta:
- [ ] Uptime > 99%
- [ ] Page load times < 3s
- [ ] No critical bugs in first 48h
- [ ] All testers can access features
- [ ] Feedback system working

## Notes for Beta Launch

1. **Soft Launch**: Start with one tester, then expand
2. **Monitor Closely**: First 24 hours are critical
3. **Quick Fixes**: Be ready to deploy patches
4. **Communication**: Keep testers informed of changes
5. **Document Everything**: Track all issues and fixes

---

**Beta Testing Timeline**: 
- Week 1: Core functionality testing
- Week 2: Performance and edge cases
- Week 3: Feedback implementation
- Week 4: Final adjustments

**Remember**: This is beta - some issues are expected. The goal is to identify and fix them before full launch!