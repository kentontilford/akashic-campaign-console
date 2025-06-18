# Deployment Errors and Fixes Log

## Railway Deployment Issues

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

## Next Steps if Memory Error Persists

1. **Use Railway's Build Configuration:**
   - Set `RAILWAY_DOCKERFILE_PATH=Dockerfile.simple` in Railway settings
   - Add `NODE_OPTIONS=--max-old-space-size=4096` as a build-time environment variable

2. **Alternative Approaches:**
   - Try using `nixpacks.toml` with custom memory settings
   - Consider using a multi-stage Docker build to reduce final image size
   - Implement incremental static regeneration (ISR) instead of static generation

3. **Memory Optimization:**
   - Reduce the number of pages built at build time
   - Use dynamic imports for heavy components
   - Split the application into smaller deployable units

---

## Environment Variables Required for Deployment

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your-secret-key

# Redis (optional but recommended)
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

## Successful Build Requirements

1. **Memory:** Minimum 4GB allocated for build process
2. **Node Version:** 20.x (specified in Dockerfile)
3. **Build Time:** Allow up to 10 minutes for initial build
4. **Database:** PostgreSQL must be accessible during build for Prisma
5. **Environment:** `SKIP_ENV_VALIDATION=1` set during build

---

## Commands for Local Testing

```bash
# Test the build locally with memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Test with custom build script
npm run build:railway

# Test Docker build
docker build -f Dockerfile.simple -t akashic-test .

# Run locally with production build
npm run build && npm run start
```