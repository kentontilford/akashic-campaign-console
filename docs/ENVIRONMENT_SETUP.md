# Complete Environment Variables Setup Guide

## 🔐 Step 1: Generate NEXTAUTH_SECRET

This is **CRITICAL** for security. You need a cryptographically secure random string.

### Option A: Using OpenSSL (Recommended)
```bash
# If you have Git Bash or WSL:
openssl rand -base64 32
```

### Option B: Using Node.js
```bash
# Run this in your terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option C: Using PowerShell
```powershell
[Convert]::ToBase64String((1..32 | ForEach {Get-Random -Maximum 256}))
```

### Option D: Online Generator
Visit: https://generate-secret.vercel.app/32

**Example output**: `Thh5c7QY6KFTR8k8mTXKgdH5Tz3RuBrPTKHBYL5DGT4=`

## 🌐 Step 2: Set Your Domain (NEXTAUTH_URL)

This must be the full URL where your app will be hosted:

### For Development:
```
NEXTAUTH_URL="http://localhost:3000"
```

### For Production:
```
# If you have a domain:
NEXTAUTH_URL="https://yourdomain.com"

# If using a subdomain:
NEXTAUTH_URL="https://app.yourdomain.com"

# If using Vercel:
NEXTAUTH_URL="https://your-app-name.vercel.app"

# If using an IP address temporarily:
NEXTAUTH_URL="http://YOUR_SERVER_IP:3000"
```

## 🤖 Step 3: OpenAI API Key

You already have this set, but for reference:

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy immediately (you can't see it again)
4. Format: `sk-proj-...` (yours is already in the file)

## 📧 Step 4: Email Configuration (Optional)

### Using SendGrid:
1. Sign up at: https://sendgrid.com
2. Go to Settings → API Keys
3. Create API Key with "Full Access"
4. Set:
   ```
   EMAIL_FROM="noreply@yourdomain.com"
   SENDGRID_API_KEY="SG.xxxxxxxxxxxx"
   ```

### Using Other Providers:
- **Resend**: Modern, developer-friendly
- **Postmark**: Great deliverability
- **AWS SES**: Cost-effective at scale

## 📱 Step 5: Social Media APIs (Optional)

### Facebook:
1. Go to: https://developers.facebook.com
2. Create App → Business
3. Get App ID and Secret from Settings → Basic

### Twitter/X:
1. Go to: https://developer.twitter.com
2. Create Project and App
3. Get API Key and Secret

## 🔍 Step 6: Monitoring (Optional but Recommended)

### Sentry (Error Tracking):
1. Sign up at: https://sentry.io
2. Create Project → Next.js
3. Copy DSN from Settings → Client Keys
4. Set: `SENTRY_DSN="https://xxxxx@xxx.ingest.sentry.io/xxxxx"`

### Logtail (Logging):
1. Sign up at: https://logtail.com
2. Create Source → HTTP
3. Copy Source Token
4. Set: `LOGTAIL_SOURCE_TOKEN="xxxxx"`

## ✅ Complete .env.production Example

```env
# ========================================
# REQUIRED VARIABLES
# ========================================

# Database (from Supabase - see setup guide below)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://your-actual-domain.com"
NEXTAUTH_SECRET="your-generated-secret-here"

# OpenAI (you already have this)
OPENAI_API_KEY="sk-proj-ymdf7G..."

# ========================================
# OPTIONAL BUT RECOMMENDED
# ========================================

# Redis (from Upstash)
REDIS_HOST="generous-caribou-12345.upstash.io"
REDIS_PORT="12345"
REDIS_PASSWORD="your-redis-password"

# Email
EMAIL_FROM="hello@your-domain.com"
SENDGRID_API_KEY="SG.xxxxxxxxxx"

# ========================================
# PRODUCTION SETTINGS
# ========================================

NODE_ENV="production"
LOG_LEVEL="info"
PORT="3000"
```