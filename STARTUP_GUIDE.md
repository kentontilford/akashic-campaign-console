# Akashic Campaign Console - Startup Guide

## Prerequisites

Before running the application, ensure you have:
- Node.js 18+ installed
- PostgreSQL database running
- Redis server (optional for development)
- OpenAI API key

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/akashic_campaign?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OpenAI (Required for AI features)
OPENAI_API_KEY="your-openai-api-key"

# Redis (Optional - will work without it)
REDIS_URL="redis://localhost:6379"
```

### 3. Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Test Credentials

Since this is a fresh installation, you'll need to:
1. Go to http://localhost:3000/register
2. Create a new account
3. Login with your credentials

## Key Features to Test

### 1. Campaign Creation
- Click "Create Campaign" from the dashboard
- Fill in campaign details
- Complete the multi-step wizard

### 2. Message Creation with AI
- Navigate to Messages → New Message
- Select a campaign
- Use the AI Assistant to generate content
- Try different audience versions (Union, Youth, etc.)

### 3. Version Control System
- Create a message
- Click "Generate Versions" to see content adapted for different audiences
- Compare versions side-by-side

### 4. Approval Workflow
- Submit a message for approval
- Check the Approvals queue
- Messages are automatically routed based on content risk

### 5. Templates
- Navigate to Templates
- Create reusable message templates
- Use templates when creating new messages

### 6. Team Management
- Go to a campaign → Team Management
- Invite team members
- Assign roles and permissions

### 7. Analytics
- View the Analytics dashboard
- Check message performance
- Monitor campaign metrics

### 8. Activity Tracking
- Navigate to Activity
- See real-time audit trail
- Filter by campaign, user, or action type

## Common Issues

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Create database if it doesn't exist: `createdb akashic_campaign`

### OpenAI API Error
- Verify your API key is valid
- Check you have credits/usage available
- API key should start with "sk-"

### NextAuth Error
- Generate a proper secret: `openssl rand -base64 32`
- Ensure NEXTAUTH_URL matches your dev URL

## Next Steps

1. Explore the Version Control system - the core differentiator
2. Test the AI message generation with different platforms
3. Try the bulk operations on multiple messages
4. Schedule messages for future publishing
5. Review the activity log for audit trail

Enjoy using Akashic Campaign Console! 🚀