# Akashic Intelligence - Testing & Quality Assurance Documentation

## Overview

This document outlines the comprehensive testing strategy, quality assurance processes, and validation frameworks for the Akashic Intelligence Campaign Console platform.

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Unit Testing Framework](#unit-testing-framework)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [API Testing](#api-testing)
6. [AI Model Testing](#ai-model-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Quality Assurance Processes](#quality-assurance-processes)
10. [Continuous Integration](#continuous-integration)
11. [Testing Environments](#testing-environments)
12. [Test Data Management](#test-data-management)

---

## Testing Strategy Overview

### Testing Pyramid Approach

```
         E2E Tests (5%)
       ─────────────────
      Integration Tests (15%)
    ─────────────────────────
   Unit Tests (80%)
 ─────────────────────────────────
```

### Core Testing Principles

- **Test Automation**: 95% of tests must be automated
- **Fast Feedback**: Unit tests complete in <2 minutes
- **Isolation**: Tests should not depend on external services
- **Maintainability**: Tests should be easy to understand and update
- **Coverage**: Minimum 90% code coverage for critical paths

### Testing Environments

- **Development**: Local testing with mocked services
- **Testing**: Automated test runs with test databases
- **Staging**: Production-like environment for E2E testing
- **Production**: Monitoring and synthetic tests

---

## Unit Testing Framework

### Technology Stack

```typescript
// Testing dependencies
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "vitest": "^1.0.0",
  "jsdom": "^22.0.0",
  "msw": "^2.0.0"
}
```

### Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        'dist/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@akashic/database': path.resolve(__dirname, '../packages/database')
    }
  }
})
```

### Test Setup

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'

// Mock service worker setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    },
    status: 'authenticated'
  }),
  signIn: vi.fn(),
  signOut: vi.fn()
}))
```

### Component Testing Examples

#### Testing Messaging Components

```typescript
// src/components/messaging/message-composer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageComposer } from './message-composer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('MessageComposer', () => {
  const mockCampaign = {
    id: 'test-campaign-id',
    name: 'Test Campaign',
    type: 'federal_house',
    profile: {
      values: ['economic-opportunity', 'healthcare'],
      keyIssues: {
        'economic-opportunity': {
          priority: 'high',
          talking_points: ['job creation', 'wage growth']
        }
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render message composition form', () => {
    renderWithProviders(
      <MessageComposer campaign={mockCampaign} />
    )

    expect(screen.getByLabelText(/message type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/target audience/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/environment/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate message/i })).toBeInTheDocument()
  })

  it('should generate message when form is submitted', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <MessageComposer campaign={mockCampaign} />
    )

    // Fill out form
    await user.selectOptions(
      screen.getByLabelText(/message type/i),
      'social_media_post'
    )
    
    await user.selectOptions(
      screen.getByLabelText(/target audience/i),
      'general_public'
    )

    await user.type(
      screen.getByLabelText(/intent/i),
      'Promote economic recovery plan'
    )

    // Submit form
    await user.click(screen.getByRole('button', { name: /generate message/i }))

    // Wait for generation
    await waitFor(() => {
      expect(screen.getByText(/generating message/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/generated message/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should show error when generation fails', async () => {
    const user = userEvent.setup()
    
    // Mock API failure
    server.use(
      rest.post('/api/messages/generate', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Generation failed' }))
      })
    )

    renderWithProviders(
      <MessageComposer campaign={mockCampaign} />
    )

    // Submit form with valid data
    await user.selectOptions(
      screen.getByLabelText(/message type/i),
      'speech'
    )

    await user.click(screen.getByRole('button', { name: /generate message/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to generate message/i)).toBeInTheDocument()
    })
  })
})
```

#### Testing Data Import Components

```typescript
// src/components/data/csv-import.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CSVImport } from './csv-import'

describe('CSVImport', () => {
  const mockCampaignId = 'test-campaign-id'

  it('should handle file upload and show preview', async () => {
    const user = userEvent.setup()
    
    render(<CSVImport campaignId={mockCampaignId} type="voters" />)

    // Create test CSV file
    const csvContent = `email,firstName,lastName,phone
john@example.com,John,Doe,(555) 123-4567
jane@example.com,Jane,Smith,(555) 987-6543`

    const file = new File([csvContent], 'test-voters.csv', {
      type: 'text/csv'
    })

    // Upload file
    const input = screen.getByLabelText(/upload csv file/i)
    await user.upload(input, file)

    // Wait for file processing
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument()
    })

    // Check preview shows data
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })

  it('should validate required field mapping', async () => {
    const user = userEvent.setup()
    
    render(<CSVImport campaignId={mockCampaignId} type="voters" />)

    // Upload file without required fields
    const csvContent = `contact,first,last
john@example.com,John,Doe`

    const file = new File([csvContent], 'incomplete.csv', {
      type: 'text/csv'
    })

    const input = screen.getByLabelText(/upload csv file/i)
    await user.upload(input, file)

    // Try to proceed without mapping required fields
    await user.click(screen.getByRole('button', { name: /import data/i }))

    await waitFor(() => {
      expect(screen.getByText(/email field is required/i)).toBeInTheDocument()
    })
  })

  it('should complete import successfully', async () => {
    const user = userEvent.setup()
    
    render(<CSVImport campaignId={mockCampaignId} type="voters" />)

    const csvContent = `email,firstName,lastName
john@example.com,John,Doe
jane@example.com,Jane,Smith`

    const file = new File([csvContent], 'voters.csv', {
      type: 'text/csv'
    })

    // Upload file
    const input = screen.getByLabelText(/upload csv file/i)
    await user.upload(input, file)

    // Wait for preview
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument()
    })

    // Field mapping should be automatic for standard fields
    expect(screen.getByDisplayValue('email')).toBeInTheDocument()
    expect(screen.getByDisplayValue('firstName')).toBeInTheDocument()

    // Start import
    await user.click(screen.getByRole('button', { name: /import data/i }))

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/import completed/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    // Check success metrics
    expect(screen.getByText('2')).toBeInTheDocument() // Created records
  })
})
```

---

## Integration Testing

### Database Integration Tests

```typescript
// src/test/integration/database.test.ts
import { prisma } from '@akashic/database'
import { execSync } from 'child_process'

describe('Database Integration', () => {
  beforeAll(async () => {
    // Reset test database
    execSync('pnpm db:reset', { stdio: 'inherit' })
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.message.deleteMany()
    await prisma.teamMember.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('Campaign Operations', () => {
    it('should create campaign with proper relationships', async () => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: 'owner@test.com',
          name: 'Campaign Owner',
          emailVerified: new Date()
        }
      })

      // Create campaign
      const campaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          slug: 'test-campaign',
          type: 'federal_house',
          state: 'PA',
          district: '1',
          electionDate: new Date('2024-11-05'),
          createdById: user.id,
          profile: {
            values: ['healthcare'],
            keyIssues: {}
          }
        }
      })

      // Verify campaign owner team member was created
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          campaignId: campaign.id,
          userId: user.id,
          role: 'owner'
        }
      })

      expect(teamMember).toBeTruthy()
      expect(teamMember?.role).toBe('owner')
    })

    it('should handle concurrent campaign creation', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'concurrent@test.com',
          name: 'Concurrent User',
          emailVerified: new Date()
        }
      })

      // Create multiple campaigns concurrently
      const campaigns = await Promise.all([
        prisma.campaign.create({
          data: {
            name: 'Campaign 1',
            slug: 'campaign-1',
            type: 'federal_house',
            state: 'PA',
            district: '1',
            electionDate: new Date('2024-11-05'),
            createdById: user.id,
            profile: { values: [], keyIssues: {} }
          }
        }),
        prisma.campaign.create({
          data: {
            name: 'Campaign 2',
            slug: 'campaign-2',
            type: 'federal_senate',
            state: 'PA',
            electionDate: new Date('2024-11-05'),
            createdById: user.id,
            profile: { values: [], keyIssues: {} }
          }
        })
      ])

      expect(campaigns).toHaveLength(2)
      expect(campaigns[0].slug).toBe('campaign-1')
      expect(campaigns[1].slug).toBe('campaign-2')
    })
  })

  describe('Message Operations', () => {
    it('should track message version history', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'editor@test.com',
          name: 'Message Editor',
          emailVerified: new Date()
        }
      })

      const campaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          slug: 'test-msg-campaign',
          type: 'federal_house',
          state: 'CA',
          district: '10',
          electionDate: new Date('2024-11-05'),
          createdById: user.id,
          profile: { values: [], keyIssues: {} }
        }
      })

      // Create initial message
      const message = await prisma.message.create({
        data: {
          campaignId: campaign.id,
          createdById: user.id,
          type: 'social_media_post',
          content: 'Original message content',
          audience: 'general_public',
          environment: 'social_media',
          status: 'draft'
        }
      })

      // Update message content
      const updatedMessage = await prisma.message.update({
        where: { id: message.id },
        data: {
          content: 'Updated message content',
          updatedAt: new Date()
        }
      })

      expect(updatedMessage.content).toBe('Updated message content')
      expect(updatedMessage.updatedAt.getTime()).toBeGreaterThan(
        message.createdAt.getTime()
      )
    })
  })
})
```

### API Integration Tests

```typescript
// src/test/integration/api.test.ts
import { createServer } from 'http'
import { NextApiHandler } from 'next'
import request from 'supertest'
import handler from '../../pages/api/campaigns/[id]/messages'

describe('API Integration', () => {
  let server: any

  beforeAll(() => {
    server = createServer(handler as NextApiHandler)
  })

  afterAll(() => {
    server.close()
  })

  describe('POST /api/campaigns/[id]/messages', () => {
    it('should create message with valid data', async () => {
      const campaignId = 'test-campaign-id'
      
      const response = await request(server)
        .post(`/api/campaigns/${campaignId}/messages`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          type: 'social_media_post',
          content: 'Test message content',
          audience: 'general_public',
          environment: 'social_media'
        })

      expect(response.status).toBe(201)
      expect(response.body.message).toBeDefined()
      expect(response.body.message.content).toBe('Test message content')
    })

    it('should reject invalid message data', async () => {
      const campaignId = 'test-campaign-id'
      
      const response = await request(server)
        .post(`/api/campaigns/${campaignId}/messages`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          type: 'invalid_type',
          content: '', // Empty content
          audience: 'invalid_audience'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('validation')
    })

    it('should require authentication', async () => {
      const campaignId = 'test-campaign-id'
      
      const response = await request(server)
        .post(`/api/campaigns/${campaignId}/messages`)
        .send({
          type: 'social_media_post',
          content: 'Test message',
          audience: 'general_public'
        })

      expect(response.status).toBe(401)
    })
  })
})
```

---

## End-to-End Testing

### Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit-report.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

### E2E Test Examples

```typescript
// e2e/messaging-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Messaging Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    
    // Login with test credentials
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('/dashboard')
  })

  test('should complete full message creation workflow', async ({ page }) => {
    // Navigate to campaign
    await page.click('[data-testid="campaign-link"]')
    await page.waitForURL('/campaigns/*')

    // Go to messaging
    await page.click('[data-testid="messaging-tab"]')
    
    // Create new message
    await page.click('[data-testid="new-message-button"]')
    
    // Fill out message form
    await page.selectOption('[data-testid="message-type"]', 'social_media_post')
    await page.selectOption('[data-testid="audience"]', 'general_public')
    await page.fill('[data-testid="intent"]', 'Promote healthcare policy')
    
    // Generate message
    await page.click('[data-testid="generate-button"]')
    
    // Wait for generation
    await page.waitForSelector('[data-testid="generated-message"]', {
      timeout: 30000
    })
    
    // Verify message content exists
    const messageContent = await page.textContent('[data-testid="message-content"]')
    expect(messageContent).toBeTruthy()
    expect(messageContent!.length).toBeGreaterThan(50)
    
    // Check risk analysis
    await page.click('[data-testid="risk-analysis-tab"]')
    const riskScore = await page.textContent('[data-testid="risk-score"]')
    expect(riskScore).toMatch(/\d+%/)
    
    // Save message
    await page.click('[data-testid="save-message-button"]')
    
    // Verify message appears in list
    await page.waitForSelector('[data-testid="message-list"]')
    const messageList = page.locator('[data-testid="message-item"]')
    await expect(messageList).toHaveCount(1)
  })

  test('should handle message approval workflow', async ({ page }) => {
    // Navigate to existing message
    await page.goto('/campaigns/test-campaign/messages/test-message')
    
    // Verify message is in draft status
    await expect(page.locator('[data-testid="message-status"]')).toContainText('Draft')
    
    // Submit for approval
    await page.click('[data-testid="submit-approval-button"]')
    
    // Verify status changed
    await expect(page.locator('[data-testid="message-status"]')).toContainText('Pending')
    
    // Switch to approver role (mock)
    await page.evaluate(() => {
      window.localStorage.setItem('test-role', 'campaign-manager')
    })
    await page.reload()
    
    // Approve message
    await page.click('[data-testid="approve-button"]')
    await page.fill('[data-testid="approval-notes"]', 'Looks good!')
    await page.click('[data-testid="confirm-approval"]')
    
    // Verify approval
    await expect(page.locator('[data-testid="message-status"]')).toContainText('Approved')
  })
})
```

### Performance E2E Tests

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="dashboard-loaded"]')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // 3 second budget
  })

  test('should handle large message list efficiently', async ({ page }) => {
    // Navigate to campaign with many messages
    await page.goto('/campaigns/large-campaign/messages')
    
    const startTime = Date.now()
    await page.waitForSelector('[data-testid="message-list"]')
    
    // Verify virtual scrolling performance
    const messages = page.locator('[data-testid="message-item"]')
    await expect(messages).toHaveCount(50) // Should only render visible items
    
    // Scroll and verify new items load quickly
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    
    const scrollTime = Date.now() - startTime
    expect(scrollTime).toBeLessThan(2000)
  })
})
```

---

## AI Model Testing

### Message Generation Testing

```typescript
// src/test/ai/message-generation.test.ts
import { MessageGenerator } from '@/lib/ai/message-generator'
import { openai } from '@/lib/ai/openai'

// Mock OpenAI
vi.mock('@/lib/ai/openai')
const mockOpenAI = vi.mocked(openai)

describe('Message Generation', () => {
  let generator: MessageGenerator

  beforeEach(() => {
    generator = new MessageGenerator()
    vi.clearAllMocks()
  })

  it('should generate message with proper structure', async () => {
    // Mock OpenAI response
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            content: "Healthcare is a fundamental right that every American deserves.",
            themes: ["healthcare", "rights", "accessibility"],
            reasoning: "Focused on universal healthcare appeal with rights-based framing"
          })
        }
      }]
    } as any)

    const result = await generator.generate({
      type: 'social_media_post',
      audience: 'general_public',
      environment: 'social_media',
      intent: 'Promote healthcare policy',
      tone: 'optimistic'
    }, {
      id: 'test-campaign',
      name: 'Test Campaign',
      profile: {
        values: ['healthcare'],
        keyIssues: {
          healthcare: {
            priority: 'high',
            talking_points: ['universal coverage', 'affordability']
          }
        }
      }
    })

    expect(result.content).toBeTruthy()
    expect(result.themes).toContain('healthcare')
    expect(result.reasoning).toBeTruthy()
  })

  it('should handle API failures gracefully', async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error('API rate limit exceeded')
    )

    await expect(
      generator.generate({
        type: 'speech',
        audience: 'supporters',
        intent: 'Rally support'
      }, mockCampaign)
    ).rejects.toThrow('Message generation failed')
  })

  it('should validate generated content quality', async () => {
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            content: "Short msg", // Too short
            themes: [],
            reasoning: ""
          })
        }
      }]
    } as any)

    await expect(
      generator.generate({
        type: 'speech',
        audience: 'general_public',
        intent: 'Policy announcement'
      }, mockCampaign)
    ).rejects.toThrow('Generated content quality insufficient')
  })
})
```

### Risk Analysis Testing

```typescript
// src/test/ai/risk-analysis.test.ts
import { RiskAnalyzer } from '@/lib/ai/risk-analyzer'

describe('Risk Analysis', () => {
  let analyzer: RiskAnalyzer

  beforeEach(() => {
    analyzer = new RiskAnalyzer()
  })

  it('should identify high-risk content', async () => {
    const highRiskMessage = "Our opponent is corrupt and should be imprisoned!"
    
    const analysis = await analyzer.analyze(highRiskMessage, {
      type: 'social_media_post',
      audience: 'general_public'
    })

    expect(analysis.riskScore).toBeGreaterThan(0.7)
    expect(analysis.flags).toContainEqual(
      expect.objectContaining({
        type: 'negative_attacks',
        severity: 'high'
      })
    )
  })

  it('should approve low-risk content', async () => {
    const lowRiskMessage = "We're committed to creating jobs and improving healthcare for all families."
    
    const analysis = await analyzer.analyze(lowRiskMessage, {
      type: 'speech',
      audience: 'general_public'
    })

    expect(analysis.riskScore).toBeLessThan(0.3)
    expect(analysis.flags).toHaveLength(0)
  })

  it('should provide improvement suggestions', async () => {
    const problematicMessage = "We must destroy our opponent's radical agenda!"
    
    const analysis = await analyzer.analyze(problematicMessage, {
      type: 'social_media_post',
      audience: 'general_public'
    })

    expect(analysis.suggestions).toContain(
      expect.stringContaining('Consider reframing')
    )
  })
})
```

---

## Performance Testing

### Load Testing Configuration

```typescript
// scripts/load-test.ts
import { check, sleep } from 'k6'
import http from 'k6/http'

export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  }
}

export default function () {
  // Test message generation endpoint
  const generateResponse = http.post(
    `${__ENV.BASE_URL}/api/messages/generate`,
    JSON.stringify({
      type: 'social_media_post',
      audience: 'general_public',
      intent: 'Test message generation'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${__ENV.TEST_TOKEN}`
      }
    }
  )

  check(generateResponse, {
    'generation request successful': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 5000
  })

  sleep(1)

  // Test dashboard load
  const dashboardResponse = http.get(
    `${__ENV.BASE_URL}/api/dashboard/stats`,
    {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN}`
      }
    }
  )

  check(dashboardResponse, {
    'dashboard load successful': (r) => r.status === 200,
    'dashboard load fast': (r) => r.timings.duration < 200
  })

  sleep(2)
}
```

### Database Performance Tests

```typescript
// src/test/performance/database.test.ts
import { prisma } from '@akashic/database'
import { performance } from 'perf_hooks'

describe('Database Performance', () => {
  beforeAll(async () => {
    // Seed performance test data
    await seedLargeDataset()
  })

  afterAll(async () => {
    await cleanupPerformanceData()
  })

  it('should query large message list efficiently', async () => {
    const start = performance.now()
    
    const messages = await prisma.message.findMany({
      where: {
        campaignId: 'perf-test-campaign'
      },
      take: 50,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const duration = performance.now() - start
    
    expect(messages).toHaveLength(50)
    expect(duration).toBeLessThan(100) // Should complete in <100ms
  })

  it('should handle complex analytics queries', async () => {
    const start = performance.now()
    
    const analytics = await prisma.message.groupBy({
      by: ['type', 'audience'],
      where: {
        campaignId: 'perf-test-campaign',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      _count: {
        id: true
      },
      _avg: {
        riskScore: true
      }
    })

    const duration = performance.now() - start
    
    expect(analytics.length).toBeGreaterThan(0)
    expect(duration).toBeLessThan(500) // Should complete in <500ms
  })
})

async function seedLargeDataset() {
  const campaignId = 'perf-test-campaign'
  
  // Create 1000 messages for performance testing
  const messages = Array.from({ length: 1000 }, (_, i) => ({
    campaignId,
    createdById: 'perf-test-user',
    type: ['social_media_post', 'speech', 'email'][i % 3] as any,
    content: `Performance test message ${i}`,
    audience: ['general_public', 'supporters', 'undecided'][i % 3] as any,
    environment: 'social_media',
    riskScore: Math.random(),
    status: 'approved' as any,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
  }))

  await prisma.message.createMany({
    data: messages
  })
}
```

---

## Security Testing

### Authentication Tests

```typescript
// src/test/security/auth.test.ts
import request from 'supertest'
import app from '@/app'

describe('Authentication Security', () => {
  it('should reject requests without valid tokens', async () => {
    const response = await request(app)
      .get('/api/campaigns')

    expect(response.status).toBe(401)
  })

  it('should reject expired tokens', async () => {
    const expiredToken = generateExpiredToken()
    
    const response = await request(app)
      .get('/api/campaigns')
      .set('Authorization', `Bearer ${expiredToken}`)

    expect(response.status).toBe(401)
  })

  it('should prevent privilege escalation', async () => {
    const memberToken = generateToken('member')
    
    const response = await request(app)
      .delete('/api/campaigns/test-campaign')
      .set('Authorization', `Bearer ${memberToken}`)

    expect(response.status).toBe(403)
  })

  it('should rate limit authentication attempts', async () => {
    const attempts = Array.from({ length: 6 }, () =>
      request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'wrong-password'
        })
    )

    const responses = await Promise.all(attempts)
    
    // Should rate limit after 5 attempts
    expect(responses[5].status).toBe(429)
  })
})
```

### Input Validation Tests

```typescript
// src/test/security/validation.test.ts
import { validateMessageInput } from '@/lib/validation/message'

describe('Input Validation Security', () => {
  it('should sanitize HTML input', () => {
    const maliciousInput = '<script>alert("xss")</script>Hello world'
    
    const result = validateMessageInput({
      type: 'social_media_post',
      content: maliciousInput,
      audience: 'general_public',
      environment: 'social_media'
    })

    expect(result.success).toBe(true)
    expect(result.data?.content).not.toContain('<script>')
    expect(result.data?.content).toContain('Hello world')
  })

  it('should prevent SQL injection attempts', () => {
    const sqlInjection = "'; DROP TABLE messages; --"
    
    const result = validateMessageInput({
      type: 'social_media_post',
      content: sqlInjection,
      audience: 'general_public',
      environment: 'social_media'
    })

    expect(result.success).toBe(true)
    expect(result.data?.content).not.toContain('DROP TABLE')
  })

  it('should enforce content length limits', () => {
    const tooLongContent = 'a'.repeat(10001) // Exceeds 10k limit
    
    const result = validateMessageInput({
      type: 'social_media_post',
      content: tooLongContent,
      audience: 'general_public',
      environment: 'social_media'
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].code).toBe('too_big')
  })
})
```

---

## Quality Assurance Processes

### Code Review Checklist

```markdown
## Code Review Checklist

### Functionality
- [ ] Code meets acceptance criteria
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

### Security
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Authentication/authorization checks
- [ ] Sensitive data protection

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added where needed
- [ ] Test coverage meets requirements
- [ ] Tests are meaningful and comprehensive

### Code Quality
- [ ] Code follows project conventions
- [ ] TypeScript types are proper
- [ ] No console.log in production code
- [ ] Documentation updated
- [ ] Accessibility considerations

### Database
- [ ] Migrations are backward compatible
- [ ] Indexes added for performance
- [ ] Data integrity constraints
- [ ] Proper transaction handling
```

### Release Testing Process

1. **Pre-Release Testing**
   - All automated tests pass
   - Manual smoke testing
   - Performance regression testing
   - Security scan results review

2. **Staging Deployment**
   - Deploy to staging environment
   - Run full E2E test suite
   - Load testing with production-like data
   - Integration testing with external services

3. **User Acceptance Testing**
   - Internal team testing
   - Beta user feedback collection
   - Accessibility testing
   - Cross-browser compatibility

4. **Production Readiness**
   - Database migration testing
   - Rollback plan verification
   - Monitoring and alerting setup
   - Documentation updates

### Bug Triage Process

**Severity Levels:**
- **Critical**: System down, data loss, security breach
- **High**: Major feature broken, significant user impact
- **Medium**: Feature partially broken, workaround available
- **Low**: Minor UI issues, enhancement requests

**Response Times:**
- Critical: 2 hours
- High: 1 business day
- Medium: 3 business days
- Low: Next sprint planning

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Generate Prisma client
        run: pnpm db:generate
      
      - name: Run database migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run unit tests
        run: pnpm test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  e2e:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright
        run: pnpm playwright install --with-deps
      
      - name: Start application
        run: pnpm build && pnpm start &
        env:
          NODE_ENV: test
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Wait for application
        run: npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  security:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: pnpm audit
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Quality Gates

```typescript
// scripts/quality-gates.ts
interface QualityGate {
  name: string
  threshold: number
  current: number
  passed: boolean
}

async function runQualityGates(): Promise<boolean> {
  const gates: QualityGate[] = [
    {
      name: 'Test Coverage',
      threshold: 90,
      current: await getTestCoverage(),
      passed: false
    },
    {
      name: 'TypeScript Errors',
      threshold: 0,
      current: await getTypeScriptErrors(),
      passed: false
    },
    {
      name: 'ESLint Errors',
      threshold: 0,
      current: await getESLintErrors(),
      passed: false
    },
    {
      name: 'Security Vulnerabilities',
      threshold: 0,
      current: await getSecurityVulnerabilities(),
      passed: false
    }
  ]

  // Check each gate
  gates.forEach(gate => {
    gate.passed = gate.current <= gate.threshold
  })

  // Report results
  console.log('Quality Gates Report:')
  gates.forEach(gate => {
    const status = gate.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${gate.name}: ${gate.current}/${gate.threshold}`)
  })

  return gates.every(gate => gate.passed)
}

if (require.main === module) {
  runQualityGates().then(passed => {
    process.exit(passed ? 0 : 1)
  })
}
```

---

## Testing Environments

### Environment Configuration

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: akashic_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data

  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"

  app-test:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      NODE_ENV: test
      DATABASE_URL: postgresql://test:test@postgres-test:5432/akashic_test
      REDIS_URL: redis://redis-test:6379
      NEXTAUTH_SECRET: test-secret
      NEXTAUTH_URL: http://localhost:3000
    ports:
      - "3001:3000"
    depends_on:
      - postgres-test
      - redis-test

volumes:
  postgres_test_data:
```

### Test Data Management

```typescript
// src/test/fixtures/index.ts
export const testUsers = {
  campaignOwner: {
    email: 'owner@test.com',
    name: 'Campaign Owner',
    role: 'owner'
  },
  campaignManager: {
    email: 'manager@test.com',
    name: 'Campaign Manager',
    role: 'admin'
  },
  contentCreator: {
    email: 'creator@test.com',
    name: 'Content Creator',
    role: 'member'
  }
}

export const testCampaigns = {
  federalHouse: {
    name: 'PA-01 Federal House Campaign',
    slug: 'pa-01-federal-house',
    type: 'federal_house',
    state: 'PA',
    district: '1',
    electionDate: '2024-11-05'
  },
  stateAssembly: {
    name: 'NY Assembly District 75',
    slug: 'ny-assembly-75',
    type: 'state_assembly',
    state: 'NY',
    district: '75',
    electionDate: '2024-11-05'
  }
}

export const testMessages = {
  socialMediaPost: {
    type: 'social_media_post',
    content: 'Test social media message content',
    audience: 'general_public',
    environment: 'social_media',
    status: 'draft'
  },
  speech: {
    type: 'speech',
    content: 'Test speech content for campaign event',
    audience: 'supporters',
    environment: 'campaign_event',
    status: 'approved'
  }
}

// Database seeding functions
export async function seedTestData() {
  await seedUsers()
  await seedCampaigns()
  await seedMessages()
}

export async function cleanupTestData() {
  await prisma.message.deleteMany({
    where: { campaignId: { contains: 'test' } }
  })
  await prisma.teamMember.deleteMany({
    where: { campaignId: { contains: 'test' } }
  })
  await prisma.campaign.deleteMany({
    where: { slug: { contains: 'test' } }
  })
  await prisma.user.deleteMany({
    where: { email: { contains: 'test.com' } }
  })
}
```

---

This comprehensive testing documentation ensures the Akashic Intelligence platform maintains high quality, security, and performance standards throughout development and production deployment.
