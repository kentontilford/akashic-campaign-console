# Quick Start Guide
## Akashic Intelligence Campaign Console

### Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure Overview](#project-structure-overview)
4. [Core Concepts](#core-concepts)
5. [Getting Started with Development](#getting-started-with-development)
6. [Key Development Workflows](#key-development-workflows)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## Prerequisites

### Required Software
```bash
# Node.js (v20 or higher)
node --version  # Should be v20.x.x or higher

# pnpm (recommended package manager)
npm install -g pnpm

# PostgreSQL (v15 or higher)
psql --version

# Redis (v7 or higher)
redis-server --version

# Docker Desktop (for containerized services)
docker --version
docker-compose --version

# Git
git --version
```

### Required Accounts & API Keys
- **OpenAI API Key**: [Get from OpenAI Platform](https://platform.openai.com/api-keys)
- **Vector Database**: [Pinecone](https://pinecone.io) or [Weaviate](https://weaviate.io)
- **AWS Account**: For S3 storage (optional for local development)
- **SendGrid Account**: For email services (optional for local development)

---

## Development Environment Setup

### 1. Clone the Repository
```bash
# Clone the main repository
git clone https://github.com/akashic-intelligence/campaign-console.git
cd campaign-console

# Install dependencies
pnpm install
```

### 2. Database Setup

#### Option A: Docker Compose (Recommended for Development)
```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

#### Option B: Local Installation
```bash
# PostgreSQL setup
createdb akashic_campaigns_dev
createdb akashic_campaigns_test

# Redis setup (usually runs on default port 6379)
redis-server
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

**Essential Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/akashic_campaigns_dev"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# AI Services
OPENAI_API_KEY="sk-your-openai-api-key"

# Vector Database (choose one)
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="akashic-campaigns-dev"

# Development flags
NODE_ENV="development"
FEATURE_AI_MESSAGE_GENERATION="true"
```

### 4. Database Migration & Seeding
```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma db push

# Seed development data
pnpm prisma db seed
```

### 5. Start Development Server
```bash
# Start the development server
pnpm dev

# The application will be available at:
# http://localhost:3000
```

---

## Project Structure Overview

```
campaign-console/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Main application routes
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── campaign/         # Campaign-specific components
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Authentication configuration
│   │   ├── db.ts             # Database client
│   │   ├── ai/               # AI service clients
│   │   └── utils.ts          # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── hooks/                # Custom React hooks
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts              # Database seeding
├── public/                   # Static assets
├── docs/                     # Documentation
├── tests/                    # Test files
│   ├── __mocks__/           # Test mocks
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
├── docker-compose.yml        # Development services
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## Core Concepts

### 1. Campaign Architecture
```typescript
// Core entities and their relationships
Campaign → Messages → Versions
Campaign → Team Members → Roles
Campaign → Voters → Segments
Campaign → Events → Attendees
```

### 2. Version Control System
The heart of our differentiation - dynamic audience profiling:

```typescript
interface VersionProfile {
  name: string;          // "Union", "Chamber", "Youth"
  tone: string;          // Communication style
  emphasis: string[];    // Key topics to highlight
  avoid: string[];       // Topics to avoid
}

// Usage in message generation
const unionMessage = await generateMessage({
  prompt: "Healthcare policy update",
  versionProfile: "union",
  platform: "email"
});
```

### 3. AI Integration Points
- **Message Generation**: Context-aware content creation
- **Risk Assessment**: Multi-factor content analysis
- **Strategic Intelligence**: Pattern matching and insights
- **Performance Prediction**: Engagement forecasting

### 4. Real-time Collaboration
- **WebSocket Events**: Live document editing
- **Presence System**: Team member activity
- **Conflict Resolution**: Operational Transform patterns

---

## Getting Started with Development

### 1. Create Your First Campaign
```bash
# Using the seeded demo data, or create via UI
# Navigate to: http://localhost:3000/campaigns/new
```

### 2. Understanding the Data Flow
```typescript
// Example: Message creation workflow
1. User inputs → Version Control selector
2. AI prompt generation → OpenAI API
3. Content analysis → Risk assessment
4. Approval routing → Team notifications
5. Publishing → Platform integrations
```

### 3. Key Files to Understand

#### Database Schema (`prisma/schema.prisma`)
```prisma
model Campaign {
  id                     String   @id @default(cuid())
  name                   String
  candidateName         String
  versionControlProfiles Json     // Dynamic audience profiles
  messages              Message[]
  teamMembers           TeamMember[]
  // ... other fields
}
```

#### AI Integration (`src/lib/ai/orchestrator.ts`)
```typescript
export class AIOrchestrator {
  async generateMessage(request: MessageGenerationRequest) {
    // 1. Build context-aware prompt
    // 2. Call OpenAI API
    // 3. Analyze response
    // 4. Return enhanced result
  }
}
```

#### API Routes (`src/app/api/`)
```typescript
// Example: Message generation endpoint
// src/app/api/messages/generate/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const result = await aiOrchestrator.generateMessage(body);
  return Response.json(result);
}
```

---

## Key Development Workflows

### 1. Adding a New Feature

#### Step 1: Database Changes
```bash
# 1. Update Prisma schema
nano prisma/schema.prisma

# 2. Create migration
pnpm prisma db push

# 3. Regenerate client
pnpm prisma generate
```

#### Step 2: API Development
```typescript
// 1. Create API route
// src/app/api/new-feature/route.ts
export async function POST(request: Request) {
  // Implementation
}

// 2. Add TypeScript types
// src/types/new-feature.ts
export interface NewFeature {
  // Type definitions
}

// 3. Create service layer
// src/lib/services/new-feature.ts
export class NewFeatureService {
  // Business logic
}
```

#### Step 3: UI Components
```typescript
// 1. Create UI component
// src/components/new-feature/NewFeatureForm.tsx
export function NewFeatureForm() {
  // Component implementation
}

// 2. Add to page
// src/app/(dashboard)/new-feature/page.tsx
import { NewFeatureForm } from '@/components/new-feature/NewFeatureForm';

export default function NewFeaturePage() {
  return <NewFeatureForm />;
}
```

#### Step 4: Testing
```bash
# 1. Write unit tests
# tests/unit/new-feature.test.ts

# 2. Write integration tests
# tests/integration/new-feature.test.ts

# 3. Run tests
pnpm test
```

### 2. Working with AI Features

#### Message Generation Example
```typescript
// 1. Create prompt template
const template = `
You are a campaign strategist for {candidateName}.
Create a {platform} message about {topic}.
Audience: {versionProfile}
Tone: {tone}
Length: {targetLength}
`;

// 2. Build context
const context = {
  candidateName: campaign.candidateName,
  platform: 'email',
  topic: userInput,
  versionProfile: selectedProfile.name,
  tone: selectedProfile.tone,
  targetLength: 'medium'
};

// 3. Generate message
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ 
    role: 'user', 
    content: buildPrompt(template, context) 
  }]
});
```

#### Risk Assessment Integration
```typescript
// Analyze generated content
const riskScore = await analyzeContent({
  content: generatedMessage,
  factors: ['political_sensitivity', 'factual_accuracy'],
  campaign: campaignContext
});

// Route based on risk
const approvalTier = riskScore > 0.6 ? 'red' : 
                   riskScore > 0.3 ? 'yellow' : 'green';
```

### 3. Real-time Features Development

#### WebSocket Setup
```typescript
// Server-side (Socket.io)
io.on('connection', (socket) => {
  socket.on('join-campaign', (campaignId) => {
    socket.join(`campaign-${campaignId}`);
  });
  
  socket.on('message-edit', (data) => {
    socket.to(`campaign-${data.campaignId}`)
          .emit('message-updated', data);
  });
});

// Client-side
const socket = io();
socket.emit('join-campaign', campaignId);
socket.on('message-updated', handleMessageUpdate);
```

---

## Testing Strategy

### 1. Unit Tests
```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:coverage
```

**Example Unit Test:**
```typescript
// tests/unit/ai/prompt-builder.test.ts
import { PromptBuilder } from '@/lib/ai/prompt-builder';

describe('PromptBuilder', () => {
  it('should build context-aware prompts', () => {
    const builder = new PromptBuilder(template)
      .setCampaignContext(mockCampaign)
      .setVersionProfile(mockProfile);
    
    const prompt = builder.build();
    expect(prompt).toContain(mockCampaign.candidateName);
    expect(prompt).toContain(mockProfile.tone);
  });
});
```

### 2. Integration Tests
```bash
# Run integration tests
pnpm test:integration
```

**Example Integration Test:**
```typescript
// tests/integration/api/messages.test.ts
describe('Messages API', () => {
  it('should generate message with AI', async () => {
    const response = await request(app)
      .post('/api/messages/generate')
      .send({
        campaignId: testCampaign.id,
        prompt: 'Healthcare policy',
        platform: 'email'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.content).toBeDefined();
    expect(response.body.riskAssessment).toBeDefined();
  });
});
```

### 3. End-to-End Tests
```bash
# Run E2E tests
pnpm test:e2e
```

**Example E2E Test:**
```typescript
// tests/e2e/message-creation.test.ts
import { test, expect } from '@playwright/test';

test('create and publish message', async ({ page }) => {
  await page.goto('/campaigns/demo/messages');
  await page.click('[data-testid="create-message"]');
  await page.fill('[data-testid="message-title"]', 'Test Message');
  await page.fill('[data-testid="message-content"]', 'Test content');
  await page.click('[data-testid="generate-ai"]');
  await expect(page.locator('[data-testid="ai-content"]')).toBeVisible();
});
```

---

## Deployment Guide

### 1. Local Production Build
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### 2. Docker Deployment
```bash
# Build Docker image
docker build -t akashic-campaigns .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Environment-Specific Deployment

#### Staging
```bash
# Set staging environment
export NODE_ENV=staging

# Deploy to staging
pnpm deploy:staging
```

#### Production
```bash
# Set production environment
export NODE_ENV=production

# Deploy to production
pnpm deploy:production
```

### 4. Database Migrations in Production
```bash
# Run migrations
pnpm prisma migrate deploy

# Generate client
pnpm prisma generate
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check PostgreSQL service
sudo service postgresql status

# Check connection string
psql $DATABASE_URL

# Reset database
pnpm prisma db push --force-reset
```

#### 2. AI API Issues
```bash
# Verify API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# Check rate limits
# Monitor API usage in OpenAI dashboard
```

#### 3. Development Server Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Check port conflicts
lsof -i :3000
```

#### 4. Vector Database Issues
```bash
# Pinecone connection test
curl -X GET "https://api.pinecone.io/databases" \
     -H "Api-Key: $PINECONE_API_KEY"

# Recreate index if needed
# Use Pinecone console or API
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
export DEBUG=*

# Run with debug information
pnpm dev
```

### Common Error Messages

#### "Prisma Client Not Generated"
```bash
pnpm prisma generate
```

#### "OpenAI API Rate Limit"
```bash
# Check usage limits
# Implement exponential backoff
# Consider upgrading API plan
```

#### "WebSocket Connection Failed"
```bash
# Check Redis connection
redis-cli ping

# Verify Socket.io configuration
# Check firewall settings
```

---

## Next Steps

### 1. Explore Core Features
1. **Campaign Creation**: Create your first campaign
2. **Message Generation**: Try the AI-powered message creation
3. **Version Control**: Experiment with different audience profiles
4. **Team Collaboration**: Invite team members and test real-time features

### 2. Development Deep Dives
1. **AI Integration**: Study the prompt engineering framework
2. **Database Design**: Understand the schema and relationships
3. **API Architecture**: Explore the REST and GraphQL endpoints
4. **UI Components**: Review the design system and component library

### 3. Advanced Topics
1. **Performance Optimization**: Caching, database optimization
2. **Security Implementation**: Authentication, authorization, data protection
3. **Monitoring Setup**: Logging, metrics, alerting
4. **Scaling Strategies**: Load balancing, horizontal scaling

### 4. Contributing Guidelines
1. **Code Standards**: ESLint, Prettier configuration
2. **Git Workflow**: Feature branches, pull requests, code review
3. **Documentation**: Keep docs updated with changes
4. **Testing**: Maintain test coverage above 80%

### 5. Additional Resources

#### Documentation
- [Technical Requirements Document](./campaign-console-trd.md)
- [Product Requirements Document](./campaign-console-prd.md)
- [Database Schema](./campaign-console-database.md)
- [API Specification](./api-specification.yaml)

#### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

#### Community
- Project Discord/Slack (internal)
- GitHub Issues for bug reports
- Weekly development standups
- Monthly architecture reviews

---

## Quick Reference Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma studio    # Open database GUI
pnpm prisma db push   # Push schema changes
pnpm prisma db seed   # Seed development data

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Run with coverage

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier

# Docker
docker-compose up -d  # Start services
docker-compose down   # Stop services
docker-compose logs   # View logs
```

---

**Welcome to Akashic Intelligence Campaign Console development!** 

This guide provides the foundation for getting started. As you become more familiar with the codebase, refer to the detailed technical documentation for advanced topics and architectural decisions.

For questions or support, reach out to the development team or check the project documentation repository.