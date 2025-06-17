# Claude Code Development Guide

## Important Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

### Database
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:push      # Push schema changes without migration
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database with demo data
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── (auth)/         # Authentication pages (login, register)
│   ├── (dashboard)/    # Protected dashboard pages
│   └── api/            # API routes
├── components/         # React components
│   ├── layout/         # Layout components (Navigation, PageLayout)
│   ├── ui/             # Reusable UI components
│   ├── version-control/# Version control components
│   └── providers/      # Context providers
├── lib/                # Utility libraries
│   ├── ai/             # AI service integration
│   ├── auth.ts         # NextAuth configuration
│   ├── db.ts           # Prisma database client
│   ├── redis.ts        # Redis cache client
│   └── version-control.ts # Version control engine
└── prisma/             # Database schema and migrations
```

## Key Features Implemented

### 1. Version Control System (Core Differentiator)
- 6 audience profiles: Union, Chamber, Youth, Senior, Rural, Urban
- Dynamic message adaptation based on selected profile
- Profile-aware AI content generation

### 2. Authentication & Authorization
- NextAuth.js with credentials provider
- Role-based access control (RBAC)
- Protected routes and API endpoints

### 3. Campaign Management
- Campaign creation wizard with multi-step form
- Comprehensive candidate profiling
- Team member management
- Activity tracking

### 4. AI Integration
- OpenAI GPT-4 integration
- Version-aware prompt engineering
- Platform-specific content formatting

## Database Schema Overview

### Core Entities
- **User**: Authentication and user profiles
- **Campaign**: Political campaigns with candidate profiles
- **Message**: Content with version control and approval workflow
- **MessageVersion**: Different versions for different audiences
- **CampaignMember**: Team members with roles and permissions
- **Activity**: Audit trail for all actions

## Development Workflow

### Adding a New Feature
1. Update Prisma schema if needed
2. Run `npm run prisma:migrate` to update database
3. Create API route in `src/app/api/`
4. Build UI components in `src/components/`
5. Add page in appropriate app directory
6. Update types and interfaces as needed

### Testing Locally
1. Ensure PostgreSQL and Redis are running
2. Set up `.env` file with required variables
3. Run `npm run prisma:migrate` to set up database
4. Run `npm run prisma:seed` for demo data
5. Start dev server with `npm run dev`

### Default Login Credentials
- Email: admin@akashic.com
- Password: admin123

## Next Implementation Steps

1. **Message Creation Interface**
   - Rich text editor with TipTap
   - AI content generation UI
   - Version preview system
   - Platform-specific formatting

2. **Approval Workflow**
   - Three-tier approval system (Green/Yellow/Red)
   - Content analysis for risk assessment
   - Approval queue interface

3. **Publishing System**
   - Multi-platform publishing
   - Message scheduling
   - Publishing history

4. **Analytics Dashboard**
   - Message performance tracking
   - Engagement metrics
   - Version comparison

## Common Issues & Solutions

### Database Connection Errors
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run `npm run prisma:generate` after schema changes

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check session configuration in auth.ts
- Ensure cookies are enabled

### TypeScript Errors
- Run `npm run typecheck` to identify issues
- Ensure all imports have proper types
- Update type definitions when changing schemas