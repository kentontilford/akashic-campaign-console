# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ database
- Redis server (optional but recommended)
- Domain name with SSL certificate

## Database Migration Strategy

### 1. Initial Deployment

```bash
# Generate Prisma client
npm run prisma:generate

# Deploy migrations to production database
npm run prisma:migrate:deploy
```

### 2. Migration Workflow

#### Development
```bash
# Create a new migration
npm run prisma:migrate -- --name add_feature_name

# Test migration locally
npm run prisma:migrate
```

#### Staging/Production
```bash
# Always backup before migrating
npm run db:backup

# Deploy pending migrations
npm run prisma:migrate:deploy

# Verify migration status
npx prisma migrate status
```

### 3. Rollback Strategy

If a migration fails or causes issues:

```bash
# Restore from backup
npm run db:restore

# Fix the migration in development
# Then re-deploy when ready
```

## Backup Strategy

### Automated Backups

Set up a cron job for daily backups:

```bash
# Add to crontab (crontab -e)
0 2 * * * cd /path/to/app && npm run db:backup >> /var/log/akashic-backup.log 2>&1
```

### Manual Backup

```bash
npm run db:backup
```

Backups are stored in `./backups/` directory and automatically cleaned up after 7 days.

### Restore from Backup

```bash
npm run db:restore
# Follow prompts to select backup file
```

## Environment Configuration

### 1. Production Environment Variables

```bash
# Copy example and update values
cp .env.example .env.production

# Required variables:
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_HOST=your-redis-host
REDIS_PORT=6379
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
OPENAI_API_KEY=sk-...
```

### 2. Security Checklist

- [ ] Generate strong NEXTAUTH_SECRET (32+ characters)
- [ ] Use HTTPS for NEXTAUTH_URL
- [ ] Set secure database password
- [ ] Enable Redis password if exposed
- [ ] Review and set CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerting

## Build and Deployment

### 1. Production Build

```bash
# Validate environment
npm run check-env

# Run production build
npm run build:production

# Start production server
npm run start
```

### 2. Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring

### 1. Health Check Endpoint

The application provides a health check at `/api/health`

### 2. Logging

- Application logs: Check PM2 logs with `pm2 logs`
- Database logs: PostgreSQL logs location varies by system
- Nginx logs: `/var/log/nginx/`

### 3. Database Monitoring

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT pg_database_size('akashic_intelligence');

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Verify DATABASE_URL format
   - Check PostgreSQL is running
   - Verify network connectivity

2. **Build failures**
   - Run `npm run typecheck` to check types
   - Ensure all dependencies are installed
   - Check Node.js version compatibility

3. **Authentication issues**
   - Regenerate NEXTAUTH_SECRET
   - Verify NEXTAUTH_URL matches your domain
   - Check cookie settings for HTTPS

### Support

For deployment support, check:
- Application logs
- Database logs
- Network connectivity
- Environment variables