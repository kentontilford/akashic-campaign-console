# Deployment Errors and Fixes Log

## Deployment Issues History

*(This log captures historical deployment errors and their resolutions. Some context might be from previous deployment platforms like Railway but the underlying issues are often general.)*

### Error 1: ESLint TypeScript Rules Not Found
**Date:** 2025-06-18  
**Error Message:**
```
Definition for rule '@typescript-eslint/no-unused-vars' was not found
Definition for rule '@typescript-eslint/no-explicit-any' was not found
```

**Cause:** ESLint configuration was referencing TypeScript rules without properly extending the TypeScript ESLint plugin.

**Fix Applied:**
- Updated `.eslintrc.json` to extend `plugin:@typescript-eslint/recommended`
- Ensured `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` were in devDependencies

**Status:** ✅ Fixed

---

### Error 2: React Unescaped Entities
**Date:** 2025-06-18  
**Error Message:**
```
`"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`
`'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`
```

**Cause:** Raw quotes and apostrophes in JSX text content.

**Fix Applied:**
- Already fixed in codebase - quotes escaped with `&quot;` and apostrophes with `&apos;`

**Status:** ✅ Fixed

---

### Error 3: JavaScript Heap Out of Memory
**Date:** 2025-06-18  
**Error Message:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

**Cause:** Next.js build process consuming more memory than allocated default (~512MB).

**Fixes Applied (Progressive):**
1. **Attempt 1:** Set `NODE_OPTIONS="--max-old-space-size=2048"` in Dockerfile
2. **Attempt 2:** Increased to 4096MB in Dockerfile RUN command
3. **Attempt 3:** Modified `package.json` build script to use `node --max-old-space-size=4096` directly
4. **Attempt 4:** Created custom build script `scripts/build-with-memory.js`
5. **Attempt 5:** Added Next.js build optimizations in `next.config.mjs`

**Current Status:** 🔄 In Progress

---

### Error 4: TypeScript Variable Declaration Error
**Date:** 2025-06-18  
**Error Message:**
```
Block-scoped variable 'loadMapData' used before its declaration
```

**Cause:** Function used in useEffect before it was defined.

**Fix Applied:**
- Moved `loadMapData` function definition before the useEffect in `mapping/page.tsx`

**Status:** ✅ Fixed

---

### Error 5: ESLint Prefer-Const Error
**Date:** 2025-06-18  
**Error Message:**
```
'windowMs' is never reassigned. Use 'const' instead
```

**Cause:** Variable declared with `let` but never reassigned.

**Fix Applied:**
- Changed `let windowMs` to `const windowMs` in `middleware.ts`

**Status:** ✅ Fixed

---

## Next Steps if Memory Error Persists (General & Vercel)

1.  **Ensure `NODE_OPTIONS` is set for Vercel Builds:**
    *   In Vercel Project Settings -> Environment Variables, add `NODE_OPTIONS` with value like `"--max-old-space-size=4096"` or `"--max-old-space-size=8192"`. Ensure it's applied to the "Build" step.
    *   Our `scripts/build-vercel.js` also tries to apply a default if not set by the platform.

2.  **Review Next.js Build Configuration (`next.config.mjs`):**
    *   Consider `productionBrowserSourceMaps: false` to reduce memory.
    *   Experiment with `experimental: { cpus: N }` to limit build parallelism (e.g., N=2 or N=1).

3.  **Alternative Approaches (More Advanced):**
    *   Implement Incremental Static Regeneration (ISR) for pages that can be partially static.
    *   Break down very large pages or components.

4.  **General Memory Optimization:**
   - Reduce the number of pages built at build time
   - Use dynamic imports for heavy components
   - Split the application into smaller deployable units

---

## Environment Variables Required for Deployment

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/yourdatabase

# Authentication
NEXTAUTH_URL=https://yourproject.vercel.app # Or your custom domain
NEXTAUTH_SECRET=your-secure-random-string # Generate with openssl rand -base64 32

# Redis (optional but recommended, e.g., from Vercel KV or Upstash)
REDIS_URL=redis://...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Email (if using email features)
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
```

---

## Successful Build Requirements (Vercel Context)

1. **Memory:** Sufficient memory allocated for the build process. Set `NODE_OPTIONS="--max-old-space-size=4096"` (or higher) in Vercel build environment variables.
2. **Node Version:** Node.js 20.x (or as specified in `package.json` engines). Configure in Vercel Project Settings -> General -> Node.js Version.
3. **Build Time:** Vercel has build time limits (check their current limits, typically generous for most projects).
4. **Database Access (for Prisma Generate):** If `prisma generate` runs during build, the Vercel build environment needs access to the database.
5. **Environment Variables:** Ensure all required build-time env vars (like `SKIP_ENV_VALIDATION=1`, `DATABASE_URL` for prisma generate, `NODE_OPTIONS`) are set in Vercel.

---

## Commands for Local Testing (Simulating Vercel Build)

```bash
# Test the build locally with memory limit and Vercel-like settings
NODE_OPTIONS="--max-old-space-size=4096" SKIP_ENV_VALIDATION=1 npm run build:vercel

# Run production build locally (uses `next build` directly after prisma generate)
NODE_OPTIONS="--max-old-space-size=4096" npm run build:production

# Start locally with production build
npm run start
```