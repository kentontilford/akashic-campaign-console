#!/bin/bash

echo "🚀 Deploying to Vercel..."
echo ""
echo "This script will guide you through the deployment process."
echo ""

# Check if logged in
echo "1. Checking Vercel login status..."
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "   Not logged in. Running 'vercel login'..."
    vercel login
else
    echo "   ✓ Already logged in"
fi

echo ""
echo "2. Starting deployment..."
echo "   When prompted:"
echo "   - Set up and deploy: Y"
echo "   - Scope: Select your account"
echo "   - Link to existing project: N (create new)"
echo "   - Project name: akashic-campaign-console (or press enter for default)"
echo "   - Directory: ./ (press enter)"
echo "   - Override settings: N"
echo ""
echo "Press Enter to continue..."
read

# Deploy
vercel

echo ""
echo "3. After deployment completes:"
echo "   - Go to the Vercel dashboard"
echo "   - Add environment variables"
echo "   - Set up database (Vercel Postgres or external)"
echo ""
echo "Required environment variables:"
echo "   DATABASE_URL"
echo "   NEXTAUTH_URL (will be your Vercel URL)"
echo "   NEXTAUTH_SECRET"
echo "   OPENAI_API_KEY"
echo "   REDIS_URL (optional)"
echo ""