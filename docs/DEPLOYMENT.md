# Advanced Production Guide (Complement to Vercel Checklist)

This guide provides additional details on database management, security, and other considerations relevant for production deployments, particularly when using platforms like Vercel. For a step-by-step Vercel deployment, see `VERCEL_DEPLOYMENT_CHECKLIST.md`.

## Prerequisites for Vercel Deployment

- Vercel Account
- Git repository (GitHub, GitLab, Bitbucket)
- Node.js 18+ (as defined in `package.json` engines and Vercel project settings)
- PostgreSQL 14+ database (e.g., Vercel Postgres, Neon, Supabase, or other provider accessible by Vercel)
- Redis server (optional, e.g., Vercel KV, Upstash Redis)
- Custom Domain Name (optional, Vercel provides `*.vercel.app` domains)

## Database Migration Strategy (for Vercel)

Managing database schema changes is crucial. Prisma is used for migrations.

### 1. Initial Deployment & Subsequent Migrations

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

#### Staging/Production (Vercel Context)

**Important:** Vercel runs your application in a serverless environment. Directly running migration commands on the Vercel infrastructure post-deployment requires a specific strategy.

1.  **Ensure `DATABASE_URL` in Vercel environment variables points to the correct database.**
2.  **Strategies for running migrations (choose one or combine):**
    *   **Locally against Production DB (with EXTREME CAUTION):**
        *   Temporarily update your local `.env` file with production `DATABASE_URL`.
        *   Ensure you have proper backups.
        *   Run: `npx prisma migrate deploy`
        *   **This is risky due to potential network issues or mistakes directly affecting production.**
    *   **Via a Secure API Endpoint:**
        *   Create a protected API route in your Next.js app that, when called with a secret key, executes `npx prisma migrate deploy`.
        *   This is safer as it runs within Vercel's environment, closer to the DB if using Vercel Postgres.
        *   See `VERCEL_DEPLOYMENT_CHECKLIST.md` for a conceptual example.
    *   **Database Provider's Console/Tooling:**
        *   Many managed database services (like Vercel Postgres, Neon, Supabase) provide ways to apply SQL scripts or manage schema.
        *   Generate the SQL for your migration: `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql` (Review and apply this SQL).
    *   **Dedicated Migration Service/Container:** For complex applications, a separate service or container that can run migrations upon deployment signal might be used (more advanced setup).

3.  **Verify migration status (if possible via your chosen method or by checking DB schema).**

### 3. Rollback Strategy (Migrations)

If a migration causes issues:
1.  **Rollback the code:** Use Vercel's "Promote to Production" feature to revert to a previous stable code deployment.
2.  **Database Rollback (Complex):**
    *   Prisma does not offer automatic down-migrations.
    *   **Restore from backup:** This is the most reliable way if significant data issues occur. This depends on your database provider's backup capabilities.
    *   **Manual Correction:** Write and apply SQL to revert schema changes or fix data.
    *   Fix the faulty migration in development, test thoroughly, and then create a new migration to correct the issue.

## Database Backup Strategy (Vercel)

Vercel itself doesn't directly back up your external database. Backup responsibility lies with your chosen database provider.

- **Managed Database Providers (Vercel Postgres, Neon, Supabase, AWS RDS, etc.):**
  - These services typically offer automated point-in-time recovery (PITR) and snapshot capabilities. Configure and rely on these.
  - Familiarize yourself with their backup retention policies and restoration procedures.

- **Manual Backups (using local scripts - for external DBs without strong auto-backups):**
  - The `npm run db:backup` script (uses `pg_dump`) can still be used.
  - To do this, you'd configure your local environment to point to the production `DATABASE_URL` (ensure secure connection, VPN, or IP whitelisting if needed).
  - `npm run db:backup`
  - Store these backups securely off-site.
  - This is a manual fallback and less ideal than automated provider backups.

- **Restore from Backup:**
  - If using provider backups, follow their restoration procedures.
  - If using manual `pg_dump` files, the `npm run db:restore` script (uses `pg_restore`) can be used, again by configuring your local environment to point to the production database. This is a critical operation requiring care.

## Environment Configuration (Vercel)

### 1. Production Environment Variables (on Vercel)

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

# These are set in the Vercel Dashboard:
# Project Settings -> Environment Variables
# Ensure they are available for the correct environments (Production, Preview, Development build/runtime).
# NEXTAUTH_URL is often automatically set by Vercel as VERCEL_URL or similar system environment variables.
# You can use system environment variables or set your own.
```

### 2. Security Checklist (General & Vercel)

- [ ] Generate strong `NEXTAUTH_SECRET` (32+ characters).
- [ ] Use HTTPS for `NEXTAUTH_URL` (Vercel handles SSL automatically).
- [ ] Ensure your database connection (`DATABASE_URL`) uses SSL and has strong credentials.
- [ ] If using Redis, ensure it's password-protected if exposed (`REDIS_PASSWORD`).
- [ ] Review CORS origins (Next.js API routes default to same-origin, configurable if needed).
- [ ] Rate limiting is implemented in `middleware.ts`. Monitor its effectiveness.
- [ ] Set up monitoring/alerting (Vercel offers some, or integrate external services like Sentry).
- [ ] Regularly review Vercel security settings and audit logs.

## Build and Deployment (Vercel)

Vercel handles the build and deployment process automatically when you connect your Git repository.

### 1. Build Process
- Vercel detects Next.js projects and typically uses `npm run build` by default.
- To use our custom script `scripts/build-vercel.js` (which includes Prisma generation and memory settings), you can:
    - Set the **Build Command** in Vercel Project Settings -> Build & Development Settings to `npm run build:vercel`.
    - The `build:vercel` script in `package.json` executes `node scripts/build-vercel.js`.
- Key build-time environment variables like `NODE_OPTIONS="--max-old-space-size=4096"` and `SKIP_ENV_VALIDATION=1` should be set in Vercel's environment variable settings for the build step.

### 2. Deployment
- After a successful build, Vercel deploys the application.
- Each push to the connected branch (e.g., `main`) triggers a new deployment.
- Preview deployments are created for pull requests.

Vercel manages the serving of the application; no manual `npm run start`, PM2, or Nginx configuration is needed.

## Monitoring (Vercel & External)

### 1. Health Check Endpoint
The application provides health check endpoints:
- `/api/health` (detailed)
- `/api/health-simple` (basic)
Monitor these using external uptime services.

### 2. Logging
- **Application Logs:** Viewable in the Vercel Dashboard (Functions logs for API routes and server-side rendering).
- **Build Logs:** Viewable in the Vercel Dashboard during and after builds.
- **Database Logs:** Access through your database provider's dashboard (e.g., Vercel Postgres, Neon).

### 3. Database Monitoring (via Provider)

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