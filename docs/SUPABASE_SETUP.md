# 🚀 Complete Supabase PostgreSQL Setup Guide

## Prerequisites
- A web browser (Chrome, Firefox, Edge, etc.)
- Your email address
- About 10-15 minutes

## 📝 Part 1: Create Supabase Account

### Step 1: Navigate to Supabase
1. Open your web browser
2. Go to: https://supabase.com
3. Click the green **"Start your project"** button in the top right

### Step 2: Sign Up
1. You'll see "Create your account"
2. Choose one of these options:
   - **GitHub** (Recommended if you have GitHub)
   - **Email** (Use any email address)

#### If using Email:
1. Enter your email address
2. Click **"Continue"**
3. Check your email for a magic link
4. Click the link in the email (subject: "Confirm your signup")
5. You'll be redirected back to Supabase

## 🏗️ Part 2: Create Your Database Project

### Step 3: Start New Project
1. After login, you'll see the dashboard
2. Click **"New project"** button (green button)

### Step 4: Configure Your Project

Fill in these fields:

1. **Organization**:
   - If first time: It will say "Personal" or ask you to create one
   - Name it something like "My Projects" or your company name

2. **Project name**:
   - Enter: `akashic-campaign-console`
   - This will be part of your database URL

3. **Database Password**:
   - Click **"Generate a password"** (recommended)
   - **IMPORTANT**: Copy this password immediately!
   - Save it somewhere safe (you'll need it soon)
   - Example: `7x$mK9#pL2@nQ5`

4. **Region**:
   - Choose the closest to your users
   - For US: `East US (Northern Virginia)`
   - For Europe: `West EU (Ireland)`
   - For Asia: `Southeast Asia (Singapore)`

5. **Pricing Plan**:
   - Leave as **"Free"** (perfect for starting)

### Step 5: Create Project
1. Click **"Create new project"** button
2. Wait for provisioning (shows a loading screen with fun facts)
3. This takes about 2 minutes
4. You'll see "Setting up your database" with a progress bar

## 🔗 Part 3: Get Your Connection String

### Step 6: Access Connection Settings
1. Once the project is ready, you'll see the dashboard
2. Look at the left sidebar
3. Click on **"Settings"** (gear icon at bottom)
4. Click on **"Database"** in the submenu

### Step 7: Find Connection String
1. Scroll down to **"Connection string"** section
2. You'll see a dropdown that says **"URI"**
3. The connection string looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### Step 8: Copy for Connection Pooling
1. **IMPORTANT**: Click the dropdown that says **"URI"**
2. Change it to **"Connection pooling"**
3. Make sure **"Mode"** is set to **"Session"**
4. The URL will change slightly to include `?pgbouncer=true`
5. Click the **"Copy"** button

Your connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:6543/postgres?pgbouncer=true
```

## 📝 Part 4: Update Your Environment File

### Step 9: Update .env.production
1. Open your `.env.production` file
2. Find the line with `DATABASE_URL`
3. Replace it with your copied connection string
4. Make sure the password is included (replace `[YOUR-PASSWORD]` with the actual password)

Example:
```env
DATABASE_URL="postgresql://postgres:7x$mK9#pL2@nQ5@db.abcdefghijklmnop.supabase.co:6543/postgres?pgbouncer=true"
```

## 🛠️ Part 5: Prepare Database for Your App

### Step 10: Access SQL Editor
1. Go back to Supabase dashboard
2. In the left sidebar, click **"SQL Editor"** (terminal icon)
3. Click **"New query"** button

### Step 11: Enable UUID Extension
1. In the SQL editor, paste this:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
2. Click **"Run"** button (or press Ctrl+Enter)
3. You should see "Success. No rows returned"

### Step 12: Verify Connection
1. Create another new query
2. Paste this simple test:
   ```sql
   SELECT version();
   ```
3. Click **"Run"**
4. You should see PostgreSQL version info

## 🔄 Part 6: Run Database Migrations

### Step 13: Prepare for Migrations
1. Open your terminal/command prompt
2. Navigate to your project:
   ```bash
   cd C:\Users\kento\akashic-campaign-console
   ```

### Step 14: Run Migrations
1. First, ensure your `.env.production` file has the correct `DATABASE_URL`
2. Run:
   ```bash
   # Windows Command Prompt:
   set NODE_ENV=production && npx prisma migrate deploy

   # Windows PowerShell:
   $env:NODE_ENV="production"; npx prisma migrate deploy

   # Git Bash:
   NODE_ENV=production npx prisma migrate deploy
   ```

3. You should see output like:
   ```
   Environment variables loaded from .env.production
   Prisma schema loaded from prisma\schema.prisma
   Datasource "db": PostgreSQL database "postgres" at "db.xxx.supabase.co:6543"
   
   X migrations found in prisma/migrations
   
   Applying migration...
   ```

## ✅ Part 7: Verify Everything Works

### Step 15: Check Tables Were Created
1. Go back to Supabase dashboard
2. Click **"Table Editor"** in the left sidebar
3. You should see tables like:
   - User
   - Campaign
   - Message
   - County
   - etc.

### Step 16: Test the Connection
1. In your terminal, run:
   ```bash
   # This opens Prisma Studio to view your database
   npx prisma studio
   ```
2. It should open a browser window showing your database tables
3. If it works, your connection is successful!

## 🎯 Part 8: Optional - Set Up Redis (Upstash)

### Step 17: Create Upstash Account
1. Go to: https://upstash.com
2. Sign up (free)
3. Click **"Create Database"**
4. Choose:
   - Name: `akashic-cache`
   - Region: Same as your Supabase
   - Type: **"Regional"** (not Global)
5. Click **"Create"**

### Step 18: Get Redis Credentials
1. In the Upstash dashboard, click on your database
2. You'll see:
   - Endpoint: `generous-caribou-12345.upstash.io`
   - Port: `12345`
   - Password: `xxxxx`
3. Update your `.env.production`:
   ```env
   REDIS_HOST="generous-caribou-12345.upstash.io"
   REDIS_PORT="12345"
   REDIS_PASSWORD="your-redis-password"
   ```

## 🚀 Part 9: Final Steps

### Step 19: Security Check
1. Make sure `.env.production` is in your `.gitignore`
2. Never commit this file to Git
3. Keep your database password secure

### Step 20: Backup Your Credentials
Save this information securely:
- Supabase project URL
- Database password
- Connection string
- Redis credentials (if set up)

## 🎉 Congratulations!

Your database is now fully set up and ready for production! 

### What You've Accomplished:
✅ Created a production PostgreSQL database  
✅ Configured connection pooling for better performance  
✅ Set up your environment variables correctly  
✅ Ran all database migrations  
✅ Verified everything is working  

### Next Steps:
1. Run `npm run check-env` to verify all environment variables
2. Test locally with: `npm run dev`
3. Deploy your application!

## 🆘 Troubleshooting

### "Permission denied" error
- Make sure you're using the connection pooling URL (port 6543, not 5432)

### "SSL required" error
- Add `?pgbouncer=true&sslmode=require` to your connection string

### Can't connect
- Check your password doesn't have special characters that need escaping
- Verify you're using the correct project reference in the URL

### Migration fails
- Ensure you're using the correct `.env.production` file
- Try running with explicit env file: `npx prisma migrate deploy --schema=./prisma/schema.prisma`