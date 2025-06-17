# Akashic Intelligence - Campaign Console

The Key to Comprehensive Political Understanding

## Project Overview

Akashic Intelligence is a revolutionary political campaign management platform that combines AI-powered messaging with sophisticated version control to deliver personalized, audience-aware content generation.

## Key Features

- **Version Control System**: Dynamic audience profiling that adapts messaging to specific voter segments
- **AI-Powered Messaging**: Context-aware content generation using OpenAI
- **Multi-Platform Publishing**: Support for email, social media, press releases, and more
- **Team Collaboration**: Role-based access control and approval workflows
- **Analytics Dashboard**: Track message performance and engagement

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4
- **UI Components**: Headless UI, Heroicons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Redis server
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd akashic-campaign-console
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database URL
- Redis connection
- NextAuth secret
- OpenAI API key

4. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Default Login

After seeding the database:
- Email: admin@akashic.com
- Password: admin123

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── layout/      # Layout components
│   ├── ui/          # Reusable UI components
│   └── version-control/  # Version control components
├── lib/             # Utility libraries
│   ├── ai/          # AI service integration
│   ├── auth.ts      # Authentication config
│   ├── db.ts        # Database client
│   ├── redis.ts     # Redis client
│   └── version-control.ts  # Version control engine
└── prisma/          # Database schema and migrations
```

## Development Workflow

1. **Linting**: `npm run lint`
2. **Type Checking**: `npm run typecheck`
3. **Database Changes**: Update schema in `prisma/schema.prisma`, then run `npm run prisma:migrate`
4. **Testing**: (To be implemented)

## Phase 1 Implementation Status

- [x] Core Infrastructure Setup
- [x] Database Schema Design
- [x] Authentication System
- [x] Version Control Engine
- [x] Basic UI Components
- [ ] Campaign Management CRUD
- [ ] Message Creation Interface
- [ ] AI Integration
- [ ] Approval Workflow
- [ ] Publishing System
- [ ] Analytics Dashboard

## Contributing

Please follow the established code patterns and conventions. All new features should include appropriate TypeScript types and follow the project's component structure.

## License

Proprietary - All rights reserved