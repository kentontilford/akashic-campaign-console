# Vercel Deployment Checklist for Akashic Campaign Console

## Pre-Deployment Checklist

### Environment Variables (Required on Vercel)
- [ ] `DATABASE_URL` - PostgreSQL connection string (must start with `postgresql://`). For Vercel, use a provider like Vercel Postgres, Neon, Supabase, or any other accessible Postgres database.
- [ ] `NEXTAUTH_SECRET` - Authentication secret (minimum 32 characters). Generate with `openssl rand -base64 32`.
- [ ] `NEXTAUTH_URL` - Your application's full production URL (e.g., `https://your-project.vercel.app` or `https://yourcustomdomain.com`). Vercel usually sets a default one, but ensure this matches your custom domain if used.
- [ ] `OPENAI_API_KEY` - OpenAI API key for AI features.

### Environment Variables (Optional on Vercel)
- [ ] `REDIS_URL` - Redis connection string (e.g., from Vercel KV or Upstash Redis). Falls back to in-memory cache if not provided.
- [ ] `EMAIL_FROM` - Sender email address
- [ ] `SENDGRID_API_KEY` - SendGrid API key for email notifications
- [ ] `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` - Facebook integration
- [ ] `TWITTER_API_KEY` / `TWITTER_API_SECRET` - Twitter integration

### Build-Time Environment Variables (Vercel)
- [ ] `SKIP_ENV_VALIDATION=1` - Set in Vercel project settings (Environment Variables section). The `vercel.json` also sets this.
- [ ] `NODE_ENV="production"` - Vercel sets this automatically for production builds.
- [ ] `NODE_OPTIONS="--max-old-space-size=4096"` - **IMPORTANT for preventing build failures due to memory issues.** Set this in Vercel project settings (Environment Variables section, ensure it's available to the "Build" step). Adjust memory (e.g., to `8192`) if 4096MB is insufficient. The `scripts/build-vercel.js` script also attempts to set a default if this isn't provided by the platform.
- [ ] `DATABASE_URL` (Build-time access for Prisma Generate): If your database is not publicly accessible or requires IP whitelisting, ensure Vercel's build environment can access it for `prisma generate`. Alternatively, consider generating Prisma client locally and committing it, though this is not ideal. Vercel recommends using a `vercel-build` script (like our `scripts/build-vercel.js`) which handles Prisma client generation.

## Vercel Deployment Steps

### 1. Project Setup on Vercel
- Create a new project on Vercel and connect your Git repository.
- Vercel will typically auto-detect it as a Next.js project.
- **Framework Preset:** Ensure it's set to Next.js.
- **Build Command:** Vercel usually uses `npm run build` or `next build`. If you want to ensure `scripts/build-vercel.js` (which is mapped to `npm run build:vercel`) is used, you can override the build command in Vercel Project Settings -> Build & Development Settings to `npm run build:vercel`.
- **Output Directory:** Should be `.next` (default for Next.js).
- **Install Command:** `npm install` (or `yarn install` / `pnpm install` depending on your project).

### 2. Configure Environment Variables on Vercel
- Go to your Vercel Project Settings -> Environment Variables.
- Add all **Required** and **Optional** variables listed above (e.g., `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY`, `NODE_OPTIONS`, `SKIP_ENV_VALIDATION`).
- For each variable, choose the environments (Production, Preview, Development) it should apply to. `NODE_OPTIONS` and `SKIP_ENV_VALIDATION` are particularly important for "Production" and "Preview" (for builds).

### 3. Deploy
- Pushing to your connected Git branch (e.g., `main`) will automatically trigger a deployment on Vercel.
- Alternatively, you can manually trigger deployments from the Vercel dashboard.
- Monitor the build logs in the Vercel dashboard.

### 4. Post-Deployment

#### Initialize Database Schema (Migrations & Seeding)
Vercel doesn't have a direct command execution feature like `railway run`. Here are common strategies:
- **Run migrations locally against production DB (with extreme caution):**
  ```bash
  # Ensure DATABASE_URL in your .env points to production
  npx prisma migrate deploy
  ```
  *This is risky and should only be done if you have proper backups and understand the implications.*
- **Use a dedicated migration script/service:** For complex setups, use a separate service or a script triggered by a secure webhook after deployment.
- **Manual execution via database provider's console:** Most managed database providers (Vercel Postgres, Neon, Supabase) offer a way to run SQL. You can get the SQL for migrations using:
  ```bash
  npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
  # (Review migration.sql then apply it)
  ```
- **Trigger via a secure API endpoint:** Create a special API route in your Next.js app that can trigger `prisma migrate deploy` or seeding scripts. Secure this endpoint thoroughly (e.g., with a secret key in the request).
  *Example (conceptual API route):*
  ```typescript
  // src/app/api/admin/migrate/route.ts
  // import { execSync } from 'child_process';
  // export async function POST(request: Request) {
  //   const { secret } = await request.json();
  //   if (secret === process.env.MIGRATION_SECRET) {
  //     execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  //     return Response.json({ message: 'Migration attempted.' });
  //   }
  //   return Response.json({ message: 'Unauthorized.' }, { status: 401 });
  // }
  ```
- **Seeding:** Similar to migrations. Can be done via a secure API endpoint or a local script configured with production DB credentials.
  ```bash
  # If running locally with prod DB connection in .env
  # npm run prisma:seed
  ```

#### Verify Deployment
- [ ] Check health endpoint: `https://your-project.vercel.app/api/health-simple` (or your custom domain)
- [ ] Check full health: `https://your-project.vercel.app/api/health`
- [ ] Test login functionality
- [ ] Verify AI features are working

## Troubleshooting (Vercel)

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correctly set in Vercel environment variables for the correct environments (Production, Preview, Development).
   - Ensure your database provider allows connections from Vercel's IP ranges or is publicly accessible (with strong credentials). Vercel Postgres integrates seamlessly.
   - Check database logs via your provider.

2. **Build Failures**
   - **Memory Issues:** Ensure `NODE_OPTIONS="--max-old-space-size=4096"` (or higher) is set as an environment variable in Vercel for build steps.
   - Check Vercel build logs for specific errors.
   - Ensure `SKIP_ENV_VALIDATION=1` is set.
   - Confirm Node.js version in Vercel settings (Project Settings -> General -> Node.js Version) matches your project's requirements (e.g., 20.x).
   - Verify `scripts/build-vercel.js` (or your specified build command) is running correctly.
   - Ensure Prisma client generation (`prisma generate`) is succeeding within the build.

3. **Health Check Failures / Function Timeouts**
   - Check Vercel function logs for runtime errors.
   - Verify all required runtime environment variables are set and available to functions.
   - Ensure your functions are not exceeding Vercel's execution time limits (see Vercel dashboard for Pro plan limits if applicable).

4. **Runtime Memory Issues** (Post-Deployment)
   - Monitor function memory usage in the Vercel dashboard.
   - Optimize functions for lower memory consumption.
   - If consistently hitting limits, you may need to consider Vercel's Pro/Enterprise plans for higher memory options or refactor parts of the application.
   - **Build-time memory issues** are covered under "Build Failures" above.

## Security Checklist (General & Vercel)

- [ ] `NEXTAUTH_SECRET` is unique and secure (32+ characters).
- [ ] Database uses SSL connection (standard with most managed DB providers like Vercel Postgres).
- [ ] Rate limiting is enabled (middleware.ts implements this) or explicitly disabled via `DISABLE_RATE_LIMITING` env var.
- [ ] All API keys and secrets are stored as environment variables in Vercel, not committed to the repository.
- [ ] Production logs (viewable in Vercel dashboard) don't expose sensitive information. Review your logging statements.
- [ ] Review Vercel project settings for security configurations (e.g., Git branch protection, access controls).

## Performance Optimization (Vercel)

- [ ] Redis is configured for caching (e.g., Vercel KV, Upstash Redis) if needed.
- [ ] Leverage Vercel Edge Caching for static assets and API responses where appropriate.
- [ ] Analyze Vercel's build and function performance metrics.
- [ ] Ensure appropriate memory/CPU for Vercel functions if using Pro/Enterprise plans (Hobby plan has shared resources).

## Monitoring (Vercel)

- [ ] Utilize Vercel's built-in analytics and monitoring.
- [ ] Set up error tracking (Sentry is pre-configured, ensure `SENTRY_DSN` is set in Vercel environment variables).
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

## Rollback Plan (Vercel)

If a Vercel deployment introduces issues:
1. Check Vercel deployment logs for errors (both build and function logs).
2. Verify environment variables in Vercel dashboard.
3. **Instantly Rollback:** Vercel keeps previous deployments. Go to your project's "Deployments" tab on Vercel, find a stable older deployment, click the three dots (...) and select "Promote to Production".
4. Investigate the failed deployment using Vercel's tools (logs, source inspection).
5. Fix issues in your codebase, test locally and in a Vercel preview deployment.
6. Push fixes to your production branch to trigger a new Vercel deployment.

## Notes

- This application is a Next.js app, and Vercel is optimized for Next.js. It does not use a custom `server.js` when deployed on Vercel; it uses Next.js's standard serverless functions or Edge functions.
- Redis is optional (e.g., Vercel KV or Upstash Redis). The app falls back to in-memory caching if `REDIS_URL` is not provided.
- Database migrations need a strategy for Vercel (see "Initialize Database Schema" section). The `npm run prisma:migrate:deploy` script (which falls back to `db push`) is available but needs to be triggered carefully against the production database.
- Health checks are available at `/api/health` and `/api/health-simple`.
- Rate limiting (in `middleware.ts`) can be disabled with the `DISABLE_RATE_LIMITING=true` environment variable.