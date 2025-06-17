# Integration Testing Guide
## Akashic Intelligence Campaign Console

### Overview

This comprehensive guide outlines testing procedures for all integrations within the Akashic Intelligence Campaign Console, ensuring reliable connectivity and data flow between external services, APIs, and internal systems.

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Integration Testing Framework](#integration-testing-framework)
3. [External Service Testing](#external-service-testing)
4. [API Integration Testing](#api-integration-testing)
5. [Data Pipeline Testing](#data-pipeline-testing)
6. [Real-time Integration Testing](#real-time-integration-testing)
7. [Performance & Load Testing](#performance--load-testing)
8. [Security Testing](#security-testing)
9. [Error Handling & Resilience Testing](#error-handling--resilience-testing)
10. [Automated Testing Pipelines](#automated-testing-pipelines)
11. [Test Environment Management](#test-environment-management)
12. [Monitoring & Alerting Integration Tests](#monitoring--alerting-integration-tests)

---

## Testing Strategy Overview

### Integration Categories

#### 1. External API Integrations
```
Campaign Management:
- VAN/NGP (voter data)
- ActBlue (fundraising)
- NationBuilder (CRM)
- Mailchimp (email marketing)

Data Sources:
- Google Workspace (calendar, docs, email)
- Social Media APIs (Twitter, Facebook, Instagram)
- News APIs (monitoring, sentiment)
- Census/Demographic APIs

Infrastructure:
- AWS Services (S3, RDS, Lambda)
- Authentication (Auth0, Google OAuth)
- Payment Processing (Stripe)
- Monitoring (Datadog, Sentry)
```

#### 2. Internal Service Integrations
```
Microservices:
- User Authentication Service
- Campaign Data Service
- AI/ML Processing Service
- Notification Service
- Analytics Service

Database Integrations:
- PostgreSQL (primary data)
- Redis (caching, sessions)
- Elasticsearch (search, analytics)
- File Storage (S3, local)
```

#### 3. Real-time Integrations
```
WebSocket Connections:
- Live collaboration features
- Real-time notifications
- Live dashboard updates
- Chat/messaging systems

Event Streaming:
- Kafka message queues
- Database change streams
- API webhooks
- Background job processing
```

### Testing Pyramid for Integrations

```
    /\
   /  \    E2E Integration Tests (10%)
  /____\   - Full workflow testing
 /      \  - Cross-system validation
/________\

 /\    /\   Service Integration Tests (30%)
/  \  /  \  - API contract testing
\  /  \  /  - Data validation
 \/____\/   - Error scenarios

/\  /\  /\   Component Integration Tests (60%)
/  \/  \/  \ - Individual service testing
\  /\  /\  / - Mock external services
 \/  \/  \/  - Unit-level integration
```

---

## Integration Testing Framework

### Test Structure and Organization

#### 1. Test Categories
```typescript
// test/integration/categories/
integration/
├── external-apis/           # Third-party API tests
│   ├── van-integration.test.ts
│   ├── actblue-integration.test.ts
│   ├── google-workspace.test.ts
│   └── social-media.test.ts
├── internal-services/       # Internal service tests
│   ├── auth-service.test.ts
│   ├── campaign-service.test.ts
│   ├── ai-service.test.ts
│   └── notification-service.test.ts
├── data-pipelines/         # Data flow tests
│   ├── voter-import.test.ts
│   ├── message-sync.test.ts
│   └── analytics-pipeline.test.ts
├── real-time/              # WebSocket and streaming tests
│   ├── websocket.test.ts
│   ├── notifications.test.ts
│   └── collaboration.test.ts
└── end-to-end/             # Full workflow tests
    ├── campaign-setup.test.ts
    ├── message-workflow.test.ts
    └── voter-outreach.test.ts
```

#### 2. Test Configuration
```typescript
// test/config/integration.config.ts
interface IntegrationTestConfig {
  testEnvironment: 'staging' | 'integration' | 'local'
  externalApis: {
    van: {
      baseUrl: string
      apiKey: string
      testDatabase: string
    }
    actblue: {
      baseUrl: string
      clientId: string
      clientSecret: string
      testMode: boolean
    }
    google: {
      serviceAccountKey: string
      testWorkspace: string
    }
  }
  databases: {
    postgres: {
      host: string
      database: string
      testSchema: string
    }
    redis: {
      host: string
      database: number
    }
  }
  timeout: {
    api: number        // 30 seconds
    database: number   // 10 seconds
    websocket: number  // 5 seconds
  }
}

export const integrationConfig: IntegrationTestConfig = {
  testEnvironment: process.env.TEST_ENV as any || 'integration',
  externalApis: {
    van: {
      baseUrl: process.env.VAN_TEST_URL || 'https://test-api.van.com',
      apiKey: process.env.VAN_TEST_API_KEY || '',
      testDatabase: process.env.VAN_TEST_DB || 'test_campaign'
    },
    actblue: {
      baseUrl: process.env.ACTBLUE_TEST_URL || 'https://test.actblue.com/api',
      clientId: process.env.ACTBLUE_TEST_CLIENT_ID || '',
      clientSecret: process.env.ACTBLUE_TEST_CLIENT_SECRET || '',
      testMode: true
    },
    google: {
      serviceAccountKey: process.env.GOOGLE_TEST_SERVICE_ACCOUNT || '',
      testWorkspace: process.env.GOOGLE_TEST_WORKSPACE || 'test-workspace'
    }
  },
  databases: {
    postgres: {
      host: process.env.TEST_DB_HOST || 'localhost',
      database: process.env.TEST_DB_NAME || 'akashic_integration_test',
      testSchema: 'integration_test'
    },
    redis: {
      host: process.env.TEST_REDIS_HOST || 'localhost',
      database: 1  // Use database 1 for testing
    }
  },
  timeout: {
    api: 30000,
    database: 10000,
    websocket: 5000
  }
}
```

#### 3. Base Test Classes
```typescript
// test/integration/base/BaseIntegrationTest.ts
export abstract class BaseIntegrationTest {
  protected config: IntegrationTestConfig
  protected testData: TestDataFactory
  protected cleanup: CleanupManager

  constructor() {
    this.config = integrationConfig
    this.testData = new TestDataFactory()
    this.cleanup = new CleanupManager()
  }

  async beforeAll(): Promise<void> {
    await this.setupTestEnvironment()
    await this.seedTestData()
  }

  async afterAll(): Promise<void> {
    await this.cleanup.cleanupAll()
    await this.teardownTestEnvironment()
  }

  async beforeEach(): Promise<void> {
    await this.cleanup.resetTestState()
  }

  protected abstract setupTestEnvironment(): Promise<void>
  protected abstract teardownTestEnvironment(): Promise<void>
  protected abstract seedTestData(): Promise<void>

  protected async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 10000,
    interval: number = 100
  ): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    throw new Error(`Condition not met within ${timeout}ms`)
  }

  protected async verifyDataConsistency(
    sourceData: any,
    targetData: any,
    fields: string[]
  ): Promise<void> {
    for (const field of fields) {
      expect(targetData[field]).toEqual(sourceData[field], 
        `Field ${field} does not match between source and target`)
    }
  }
}

// Test Data Factory
export class TestDataFactory {
  createTestCampaign(): Campaign {
    return {
      id: uuid(),
      name: `Test Campaign ${Date.now()}`,
      slug: `test-campaign-${Date.now()}`,
      candidate_name: 'Jane Doe',
      office: 'US House',
      state: 'PA',
      district: '1',
      election_date: '2024-11-05',
      created_at: new Date().toISOString()
    }
  }

  createTestVoter(campaignId: string): Voter {
    return {
      id: uuid(),
      campaign_id: campaignId,
      van_id: `VAN${Math.floor(Math.random() * 1000000)}`,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      street_address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: 'PA',
      zip_code: faker.location.zipCode(),
      party_affiliation: faker.helpers.arrayElement(['Democratic', 'Republican', 'Independent']),
      created_at: new Date().toISOString()
    }
  }

  createTestMessage(campaignId: string): Message {
    return {
      id: uuid(),
      campaign_id: campaignId,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
      platform: faker.helpers.arrayElement(['social_media', 'email', 'press']),
      status: 'draft',
      created_at: new Date().toISOString()
    }
  }
}
```

---

## External Service Testing

### VAN/NGP Integration Testing

#### 1. Connection and Authentication Test
```typescript
// test/integration/external-apis/van-integration.test.ts
describe('VAN Integration', () => {
  let vanClient: VANClient
  let testCampaign: Campaign

  beforeAll(async () => {
    vanClient = new VANClient({
      apiKey: integrationConfig.externalApis.van.apiKey,
      baseUrl: integrationConfig.externalApis.van.baseUrl,
      database: integrationConfig.externalApis.van.testDatabase
    })
    testCampaign = await testDataFactory.createTestCampaign()
  })

  test('should authenticate successfully with VAN API', async () => {
    const result = await vanClient.authenticate()
    expect(result.success).toBe(true)
    expect(result.user).toBeDefined()
    expect(result.permissions).toContain('read')
  })

  test('should fetch voter data from VAN', async () => {
    const voters = await vanClient.getVoters({
      limit: 10,
      filters: { state: 'PA', district: '1' }
    })

    expect(voters).toBeDefined()
    expect(Array.isArray(voters.data)).toBe(true)
    expect(voters.data.length).toBeGreaterThan(0)
    
    // Verify voter data structure
    const voter = voters.data[0]
    expect(voter).toHaveProperty('vanId')
    expect(voter).toHaveProperty('firstName')
    expect(voter).toHaveProperty('lastName')
    expect(voter).toHaveProperty('addresses')
  })

  test('should sync voter data to local database', async () => {
    const vanVoters = await vanClient.getVoters({ limit: 5 })
    
    // Trigger sync process
    const syncResult = await voterSyncService.syncFromVAN(
      testCampaign.id,
      vanVoters.data
    )

    expect(syncResult.success).toBe(true)
    expect(syncResult.processed).toBe(5)
    expect(syncResult.created).toBeGreaterThan(0)

    // Verify data in local database
    const localVoters = await db.voters.findMany({
      where: { campaign_id: testCampaign.id }
    })

    expect(localVoters.length).toBe(5)
    
    // Verify data mapping
    for (let i = 0; i < vanVoters.data.length; i++) {
      const vanVoter = vanVoters.data[i]
      const localVoter = localVoters.find(v => v.van_id === vanVoter.vanId)
      
      expect(localVoter).toBeDefined()
      expect(localVoter.first_name).toBe(vanVoter.firstName)
      expect(localVoter.last_name).toBe(vanVoter.lastName)
    }
  })

  test('should handle VAN API errors gracefully', async () => {
    // Test with invalid credentials
    const invalidClient = new VANClient({
      apiKey: 'invalid-key',
      baseUrl: integrationConfig.externalApis.van.baseUrl
    })

    await expect(invalidClient.getVoters())
      .rejects.toThrow('Authentication failed')

    // Test with malformed request
    await expect(vanClient.getVoters({ limit: -1 }))
      .rejects.toThrow('Invalid parameters')
  })

  test('should respect VAN API rate limits', async () => {
    const startTime = Date.now()
    const requests = []

    // Make multiple rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(vanClient.getVoters({ limit: 1 }))
    }

    await Promise.all(requests)
    const endTime = Date.now()

    // Should take at least some time due to rate limiting
    expect(endTime - startTime).toBeGreaterThan(1000)
  })
})
```

### ActBlue Integration Testing

#### 1. Donation Data Sync Test
```typescript
// test/integration/external-apis/actblue-integration.test.ts
describe('ActBlue Integration', () => {
  let actblueClient: ActBlueClient
  let testCampaign: Campaign

  beforeAll(async () => {
    actblueClient = new ActBlueClient({
      clientId: integrationConfig.externalApis.actblue.clientId,
      clientSecret: integrationConfig.externalApis.actblue.clientSecret,
      baseUrl: integrationConfig.externalApis.actblue.baseUrl,
      testMode: true
    })
    testCampaign = await testDataFactory.createTestCampaign()
  })

  test('should authenticate with ActBlue OAuth', async () => {
    const authResult = await actblueClient.authenticate()
    
    expect(authResult.access_token).toBeDefined()
    expect(authResult.token_type).toBe('Bearer')
    expect(authResult.expires_in).toBeGreaterThan(0)
  })

  test('should fetch contribution data', async () => {
    const contributions = await actblueClient.getContributions({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      limit: 10
    })

    expect(contributions).toBeDefined()
    expect(Array.isArray(contributions.data)).toBe(true)
    
    if (contributions.data.length > 0) {
      const contribution = contributions.data[0]
      expect(contribution).toHaveProperty('contributionId')
      expect(contribution).toHaveProperty('amount')
      expect(contribution).toHaveProperty('donorFirstName')
      expect(contribution).toHaveProperty('donorLastName')
      expect(contribution).toHaveProperty('contributedAt')
    }
  })

  test('should sync contributions to local database', async () => {
    // Create test contributions in ActBlue test environment
    const testContributions = await actblueClient.createTestContributions([
      {
        amount: 2500, // $25.00
        donorFirstName: 'John',
        donorLastName: 'Doe',
        donorEmail: 'john.doe@example.com',
        donorAddress: '123 Main St, Philadelphia, PA 19101'
      },
      {
        amount: 5000, // $50.00
        donorFirstName: 'Jane',
        donorLastName: 'Smith',
        donorEmail: 'jane.smith@example.com',
        donorAddress: '456 Oak St, Pittsburgh, PA 15201'
      }
    ])

    // Sync to local database
    const syncResult = await contributionSyncService.syncFromActBlue(
      testCampaign.id
    )

    expect(syncResult.success).toBe(true)
    expect(syncResult.processed).toBe(2)

    // Verify in local database
    const localContributions = await db.contributions.findMany({
      where: { campaign_id: testCampaign.id }
    })

    expect(localContributions.length).toBe(2)

    // Verify FEC compliance data
    for (const contribution of localContributions) {
      expect(contribution.amount).toBeGreaterThan(0)
      expect(contribution.contributor_first_name).toBeDefined()
      expect(contribution.contributor_last_name).toBeDefined()
      expect(contribution.contributor_address).toBeDefined()
      expect(contribution.contributed_at).toBeDefined()
    }
  })

  test('should handle webhook notifications', async () => {
    const webhookPayload = {
      event: 'contribution.created',
      data: {
        contributionId: 'test-contribution-123',
        amount: 10000, // $100.00
        donorFirstName: 'Test',
        donorLastName: 'Donor',
        donorEmail: 'test@example.com',
        contributedAt: new Date().toISOString()
      }
    }

    // Simulate webhook call
    const response = await request(app)
      .post('/api/webhooks/actblue')
      .send(webhookPayload)
      .set('X-ActBlue-Signature', generateActBlueSignature(webhookPayload))

    expect(response.status).toBe(200)

    // Verify contribution was processed
    const contribution = await db.contributions.findFirst({
      where: { actblue_contribution_id: 'test-contribution-123' }
    })

    expect(contribution).toBeDefined()
    expect(contribution.amount).toBe(10000)
  })
})
```

### Google Workspace Integration Testing

#### 1. Calendar and Email Integration
```typescript
// test/integration/external-apis/google-workspace.test.ts
describe('Google Workspace Integration', () => {
  let googleClient: GoogleWorkspaceClient
  let testCampaign: Campaign

  beforeAll(async () => {
    googleClient = new GoogleWorkspaceClient({
      serviceAccountKey: integrationConfig.externalApis.google.serviceAccountKey,
      workspaceId: integrationConfig.externalApis.google.testWorkspace
    })
    testCampaign = await testDataFactory.createTestCampaign()
  })

  test('should authenticate with Google Workspace', async () => {
    const authResult = await googleClient.authenticate()
    expect(authResult.success).toBe(true)
    expect(authResult.scopes).toContain('https://www.googleapis.com/auth/calendar')
    expect(authResult.scopes).toContain('https://www.googleapis.com/auth/gmail.readonly')
  })

  test('should sync calendar events', async () => {
    // Create test events in Google Calendar
    const testEvent = await googleClient.calendar.createEvent({
      summary: 'Test Campaign Event',
      description: 'Integration test event',
      start: {
        dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: new Date(Date.now() + 90000000).toISOString(), // Tomorrow + 1 hour
        timeZone: 'America/New_York'
      }
    })

    // Sync to local database
    const syncResult = await calendarSyncService.syncFromGoogle(
      testCampaign.id,
      googleClient
    )

    expect(syncResult.success).toBe(true)
    expect(syncResult.events_synced).toBeGreaterThan(0)

    // Verify event in local database
    const localEvent = await db.events.findFirst({
      where: { 
        campaign_id: testCampaign.id,
        google_event_id: testEvent.id
      }
    })

    expect(localEvent).toBeDefined()
    expect(localEvent.title).toBe('Test Campaign Event')
    expect(localEvent.start_time).toBeDefined()
  })

  test('should monitor email for campaign mentions', async () => {
    // This would require setting up test emails in the test workspace
    // For now, we'll test the monitoring service setup
    
    const monitoringSetup = await emailMonitoringService.setupGoogleMonitoring(
      testCampaign.id,
      {
        keywords: ['Jane Doe', testCampaign.name],
        labels: ['campaign', 'mentions'],
        filters: {
          fromDomain: ['@news.com', '@politico.com']
        }
      }
    )

    expect(monitoringSetup.success).toBe(true)
    expect(monitoringSetup.webhook_url).toBeDefined()
    expect(monitoringSetup.subscription_id).toBeDefined()
  })
})
```

---

## API Integration Testing

### Internal Service API Testing

#### 1. Authentication Service Integration
```typescript
// test/integration/internal-services/auth-service.test.ts
describe('Authentication Service Integration', () => {
  let authService: AuthenticationService
  let testUser: User

  beforeAll(async () => {
    authService = new AuthenticationService({
      jwtSecret: process.env.TEST_JWT_SECRET,
      database: integrationConfig.databases.postgres
    })
    testUser = await testDataFactory.createTestUser()
  })

  test('should generate and validate JWT tokens', async () => {
    // Generate token
    const tokenResult = await authService.generateToken(testUser.id, {
      roles: ['campaign_manager'],
      permissions: ['read', 'write', 'admin']
    })

    expect(tokenResult.token).toBeDefined()
    expect(tokenResult.expiresAt).toBeDefined()

    // Validate token
    const validation = await authService.validateToken(tokenResult.token)
    expect(validation.valid).toBe(true)
    expect(validation.userId).toBe(testUser.id)
    expect(validation.roles).toContain('campaign_manager')
  })

  test('should handle OAuth integration', async () => {
    const oauthResult = await authService.handleOAuthCallback({
      provider: 'google',
      code: 'test-oauth-code',
      state: 'test-state'
    })

    expect(oauthResult.success).toBe(true)
    expect(oauthResult.user).toBeDefined()
    expect(oauthResult.token).toBeDefined()
  })

  test('should enforce rate limiting', async () => {
    const promises = []
    
    // Attempt multiple rapid authentication requests
    for (let i = 0; i < 20; i++) {
      promises.push(authService.authenticateUser({
        email: testUser.email,
        password: 'wrong-password'
      }))
    }

    const results = await Promise.allSettled(promises)
    const rateLimitedResults = results.filter(
      r => r.status === 'rejected' && r.reason.code === 'RATE_LIMITED'
    )

    expect(rateLimitedResults.length).toBeGreaterThan(0)
  })
})
```

#### 2. Campaign Service Integration
```typescript
// test/integration/internal-services/campaign-service.test.ts
describe('Campaign Service Integration', () => {
  let campaignService: CampaignService
  let testUser: User
  let testCampaign: Campaign

  beforeAll(async () => {
    campaignService = new CampaignService({
      database: integrationConfig.databases.postgres,
      redis: integrationConfig.databases.redis
    })
    testUser = await testDataFactory.createTestUser()
    testCampaign = await testDataFactory.createTestCampaign()
  })

  test('should create campaign with proper validation', async () => {
    const campaignData = {
      name: 'New Test Campaign',
      candidate_name: 'John Candidate',
      office: 'State Senate',
      state: 'PA',
      district: '5',
      election_date: '2024-11-05'
    }

    const result = await campaignService.createCampaign(
      testUser.id,
      campaignData
    )

    expect(result.success).toBe(true)
    expect(result.campaign.id).toBeDefined()
    expect(result.campaign.slug).toMatch(/^[a-z0-9-]+$/)

    // Verify in database
    const dbCampaign = await db.campaigns.findUnique({
      where: { id: result.campaign.id }
    })
    expect(dbCampaign).toBeDefined()
    expect(dbCampaign.name).toBe(campaignData.name)
  })

  test('should handle team member management', async () => {
    const teamMember = await testDataFactory.createTestUser()
    
    // Add team member
    const addResult = await campaignService.addTeamMember(
      testCampaign.id,
      testUser.id, // admin user
      {
        userId: teamMember.id,
        role: 'communications',
        permissions: ['read', 'write']
      }
    )

    expect(addResult.success).toBe(true)

    // Verify permissions
    const permissions = await campaignService.getUserPermissions(
      teamMember.id,
      testCampaign.id
    )

    expect(permissions.role).toBe('communications')
    expect(permissions.permissions).toContain('read')
    expect(permissions.permissions).toContain('write')
    expect(permissions.permissions).not.toContain('admin')
  })

  test('should cache campaign data appropriately', async () => {
    // First call - should hit database
    const start1 = Date.now()
    const campaign1 = await campaignService.getCampaign(testCampaign.id)
    const time1 = Date.now() - start1

    expect(campaign1).toBeDefined()

    // Second call - should hit cache
    const start2 = Date.now()
    const campaign2 = await campaignService.getCampaign(testCampaign.id)
    const time2 = Date.now() - start2

    expect(campaign2).toEqual(campaign1)
    expect(time2).toBeLessThan(time1) // Cache should be faster
  })
})
```

---

## Data Pipeline Testing

### Voter Data Import Pipeline

#### 1. CSV Import Processing
```typescript
// test/integration/data-pipelines/voter-import.test.ts
describe('Voter Import Pipeline', () => {
  let importService: VoterImportService
  let testCampaign: Campaign

  beforeAll(async () => {
    importService = new VoterImportService({
      database: integrationConfig.databases.postgres,
      storage: { bucket: 'test-import-bucket' }
    })
    testCampaign = await testDataFactory.createTestCampaign()
  })

  test('should process CSV voter file upload', async () => {
    // Create test CSV file
    const csvData = `
VAN_ID,FirstName,LastName,Email,Phone,Address,City,State,ZIP,Party
12345,John,Doe,john@example.com,555-1234,123 Main St,Philadelphia,PA,19101,Democratic
12346,Jane,Smith,jane@example.com,555-5678,456 Oak St,Pittsburgh,PA,15201,Democratic
12347,Bob,Wilson,bob@example.com,555-9012,789 Pine St,Allentown,PA,18101,Independent
    `.trim()

    const csvFile = Buffer.from(csvData)

    // Upload and process file
    const uploadResult = await importService.uploadVoterFile(
      testCampaign.id,
      {
        filename: 'test-voters.csv',
        content: csvFile,
        contentType: 'text/csv'
      }
    )

    expect(uploadResult.success).toBe(true)
    expect(uploadResult.fileId).toBeDefined()

    // Process the file
    const processResult = await importService.processVoterFile(
      uploadResult.fileId,
      {
        fieldMapping: {
          'VAN_ID': 'van_id',
          'FirstName': 'first_name',
          'LastName': 'last_name',
          'Email': 'email',
          'Phone': 'phone',
          'Address': 'street_address',
          'City': 'city',
          'State': 'state',
          'ZIP': 'zip_code',
          'Party': 'party_affiliation'
        },
        skipHeader: true
      }
    )

    expect(processResult.success).toBe(true)
    expect(processResult.processed).toBe(3)
    expect(processResult.created).toBe(3)
    expect(processResult.errors.length).toBe(0)

    // Verify data in database
    const voters = await db.voters.findMany({
      where: { campaign_id: testCampaign.id }
    })

    expect(voters.length).toBe(3)
    
    const johnDoe = voters.find(v => v.van_id === '12345')
    expect(johnDoe).toBeDefined()
    expect(johnDoe.first_name).toBe('John')
    expect(johnDoe.last_name).toBe('Doe')
    expect(johnDoe.email).toBe('john@example.com')
  })

  test('should handle data validation errors', async () => {
    const invalidCsvData = `
VAN_ID,FirstName,LastName,Email,Phone,Address,City,State,ZIP,Party
,John,Doe,invalid-email,555-1234,123 Main St,Philadelphia,PA,19101,Democratic
12346,,Smith,jane@example.com,not-a-phone,456 Oak St,Pittsburgh,PA,15201,Democratic
12347,Bob,Wilson,bob@example.com,555-9012,789 Pine St,Allentown,XX,18101,Independent
    `.trim()

    const csvFile = Buffer.from(invalidCsvData)

    const uploadResult = await importService.uploadVoterFile(
      testCampaign.id,
      {
        filename: 'invalid-voters.csv',
        content: csvFile,
        contentType: 'text/csv'
      }
    )

    const processResult = await importService.processVoterFile(
      uploadResult.fileId,
      {
        fieldMapping: {
          'VAN_ID': 'van_id',
          'FirstName': 'first_name',
          'LastName': 'last_name',
          'Email': 'email',
          'Phone': 'phone'
        },
        validationRules: {
          van_id: { required: true },
          first_name: { required: true },
          email: { format: 'email' },
          phone: { format: 'phone' },
          state: { length: 2 }
        }
      }
    )

    expect(processResult.success).toBe(false)
    expect(processResult.processed).toBe(3)
    expect(processResult.created).toBe(0)
    expect(processResult.errors.length).toBe(3)

    // Verify specific error types
    const errors = processResult.errors
    expect(errors.some(e => e.field === 'van_id' && e.type === 'required')).toBe(true)
    expect(errors.some(e => e.field === 'email' && e.type === 'format')).toBe(true)
    expect(errors.some(e => e.field === 'phone' && e.type === 'format')).toBe(true)
  })

  test('should handle duplicate detection', async () => {
    // First import
    const csvData1 = `
VAN_ID,FirstName,LastName,Email
12345,John,Doe,john@example.com
12346,Jane,Smith,jane@example.com
    `.trim()

    await importService.processVoterFile(
      await (await importService.uploadVoterFile(testCampaign.id, {
        filename: 'voters1.csv',
        content: Buffer.from(csvData1)
      })).fileId,
      { fieldMapping: { 'VAN_ID': 'van_id', 'FirstName': 'first_name', 'LastName': 'last_name', 'Email': 'email' } }
    )

    // Second import with overlapping data
    const csvData2 = `
VAN_ID,FirstName,LastName,Email
12346,Jane,Smith,jane.smith@example.com
12347,Bob,Wilson,bob@example.com
    `.trim()

    const processResult2 = await importService.processVoterFile(
      await (await importService.uploadVoterFile(testCampaign.id, {
        filename: 'voters2.csv',
        content: Buffer.from(csvData2)
      })).fileId,
      {
        fieldMapping: { 'VAN_ID': 'van_id', 'FirstName': 'first_name', 'LastName': 'last_name', 'Email': 'email' },
        duplicateHandling: 'update'
      }
    )

    expect(processResult2.success).toBe(true)
    expect(processResult2.processed).toBe(2)
    expect(processResult2.created).toBe(1) // Bob Wilson
    expect(processResult2.updated).toBe(1) // Jane Smith

    // Verify Jane Smith was updated
    const janeSmith = await db.voters.findFirst({
      where: { van_id: '12346', campaign_id: testCampaign.id }
    })
    expect(janeSmith.email).toBe('jane.smith@example.com')
  })
})
```

### AI Processing Pipeline

#### 1. Message AI Enhancement
```typescript
// test/integration/data-pipelines/ai-processing.test.ts
describe('AI Processing Pipeline', () => {
  let aiService: AIProcessingService
  let testCampaign: Campaign
  let testMessage: Message

  beforeAll(async () => {
    aiService = new AIProcessingService({
      openai: { apiKey: process.env.OPENAI_TEST_API_KEY },
      database: integrationConfig.databases.postgres
    })
    testCampaign = await testDataFactory.createTestCampaign()
    testMessage = await testDataFactory.createTestMessage(testCampaign.id)
  })

  test('should generate AI risk assessment for message', async () => {
    const riskAssessment = await aiService.assessMessageRisk(
      testMessage.id,
      {
        content: testMessage.content,
        platform: testMessage.platform,
        targetAudience: 'general_public'
      }
    )

    expect(riskAssessment.success).toBe(true)
    expect(riskAssessment.riskScore).toBeGreaterThanOrEqual(0)
    expect(riskAssessment.riskScore).toBeLessThanOrEqual(100)
    expect(riskAssessment.categories).toBeDefined()
    expect(Array.isArray(riskAssessment.recommendations)).toBe(true)

    // Verify assessment saved to database
    const savedAssessment = await db.ai_assessments.findFirst({
      where: { message_id: testMessage.id }
    })
    expect(savedAssessment).toBeDefined()
    expect(savedAssessment.risk_score).toBe(riskAssessment.riskScore)
  })

  test('should generate message variations', async () => {
    const variations = await aiService.generateMessageVariations(
      testMessage.id,
      {
        versionProfiles: ['union_worker', 'suburban_family', 'young_professional'],
        platforms: ['social_media', 'email']
      }
    )

    expect(variations.success).toBe(true)
    expect(Array.isArray(variations.variations)).toBe(true)
    expect(variations.variations.length).toBe(6) // 3 profiles × 2 platforms

    // Verify each variation
    for (const variation of variations.variations) {
      expect(variation.content).toBeDefined()
      expect(variation.versionProfile).toBeDefined()
      expect(variation.platform).toBeDefined()
      expect(variation.content).not.toBe(testMessage.content) // Should be different
    }

    // Verify saved to database
    const savedVariations = await db.message_variations.findMany({
      where: { message_id: testMessage.id }
    })
    expect(savedVariations.length).toBe(6)
  })

  test('should process voter scoring updates', async () => {
    // Create test voters
    const voters = []
    for (let i = 0; i < 10; i++) {
      voters.push(await testDataFactory.createTestVoter(testCampaign.id))
    }

    // Process AI scoring
    const scoringResult = await aiService.updateVoterScores(
      testCampaign.id,
      {
        scoringTypes: ['turnout', 'persuasion', 'support'],
        updateReasons: ['new_data', 'model_update']
      }
    )

    expect(scoringResult.success).toBe(true)
    expect(scoringResult.processed).toBe(10)

    // Verify scores were updated
    const updatedVoters = await db.voters.findMany({
      where: { campaign_id: testCampaign.id }
    })

    for (const voter of updatedVoters) {
      expect(voter.turnout_score).toBeGreaterThanOrEqual(0)
      expect(voter.turnout_score).toBeLessThanOrEqual(100)
      expect(voter.persuasion_score).toBeGreaterThanOrEqual(0)
      expect(voter.persuasion_score).toBeLessThanOrEqual(100)
      expect(voter.support_score).toBeGreaterThanOrEqual(0)
      expect(voter.support_score).toBeLessThanOrEqual(100)
      expect(voter.scores_updated_at).toBeDefined()
    }
  })
})
```

---

## Real-time Integration Testing

### WebSocket Integration Testing

#### 1. Real-time Collaboration Features
```typescript
// test/integration/real-time/websocket.test.ts
describe('WebSocket Integration', () => {
  let wsServer: WebSocketServer
  let client1: WebSocketClient
  let client2: WebSocketClient
  let testCampaign: Campaign

  beforeAll(async () => {
    wsServer = new WebSocketServer({ port: 8080 })
    testCampaign = await testDataFactory.createTestCampaign()
    
    // Connect test clients
    client1 = new WebSocketClient('ws://localhost:8080')
    client2 = new WebSocketClient('ws://localhost:8080')
    
    await Promise.all([
      client1.connect(),
      client2.connect()
    ])

    // Authenticate clients
    await client1.authenticate(testUser1.token)
    await client2.authenticate(testUser2.token)
  })

  afterAll(async () => {
    await client1.disconnect()
    await client2.disconnect()
    wsServer.close()
  })

  test('should handle real-time message collaboration', async () => {
    const messageId = uuid()
    
    // Client 1 starts editing a message
    await client1.send({
      type: 'MESSAGE_EDIT_START',
      payload: {
        messageId,
        campaignId: testCampaign.id,
        content: 'Initial message content'
      }
    })

    // Client 2 should receive edit notification
    const editNotification = await client2.waitForMessage('MESSAGE_EDIT_NOTIFICATION')
    expect(editNotification.payload.messageId).toBe(messageId)
    expect(editNotification.payload.editor).toBe(testUser1.id)

    // Client 1 updates content
    await client1.send({
      type: 'MESSAGE_EDIT_UPDATE',
      payload: {
        messageId,
        content: 'Updated message content',
        cursorPosition: 23
      }
    })

    // Client 2 should receive content update
    const contentUpdate = await client2.waitForMessage('MESSAGE_CONTENT_UPDATE')
    expect(contentUpdate.payload.messageId).toBe(messageId)
    expect(contentUpdate.payload.content).toBe('Updated message content')

    // Client 1 stops editing
    await client1.send({
      type: 'MESSAGE_EDIT_END',
      payload: { messageId }
    })

    // Client 2 should receive edit end notification
    const editEnd = await client2.waitForMessage('MESSAGE_EDIT_END_NOTIFICATION')
    expect(editEnd.payload.messageId).toBe(messageId)
  })

  test('should broadcast real-time notifications', async () => {
    const notification = {
      type: 'CAMPAIGN_UPDATE',
      title: 'New Poll Results',
      message: 'Latest poll shows 5 point lead',
      urgency: 'high'
    }

    // Broadcast notification
    await wsServer.broadcast(testCampaign.id, notification)

    // Both clients should receive the notification
    const [notif1, notif2] = await Promise.all([
      client1.waitForMessage('NOTIFICATION'),
      client2.waitForMessage('NOTIFICATION')
    ])

    expect(notif1.payload).toEqual(notification)
    expect(notif2.payload).toEqual(notification)
  })

  test('should handle connection resilience', async () => {
    // Simulate network disconnection
    await client1.simulateDisconnection()

    // Send message while disconnected
    const messageWhileDisconnected = {
      type: 'MESSAGE_UPDATE',
      payload: { messageId: uuid(), content: 'Update while offline' }
    }

    // Reconnect
    await client1.reconnect()

    // Client should receive queued messages
    const queuedMessages = await client1.waitForQueuedMessages()
    expect(Array.isArray(queuedMessages)).toBe(true)
  })
})
```

### Event Streaming Integration

#### 1. Message Queue Processing
```typescript
// test/integration/real-time/event-streaming.test.ts
describe('Event Streaming Integration', () => {
  let producer: KafkaProducer
  let consumer: KafkaConsumer
  let testCampaign: Campaign

  beforeAll(async () => {
    producer = new KafkaProducer({
      brokers: ['localhost:9092'],
      clientId: 'test-producer'
    })
    
    consumer = new KafkaConsumer({
      brokers: ['localhost:9092'],
      groupId: 'test-consumer-group'
    })

    await producer.connect()
    await consumer.connect()
    
    testCampaign = await testDataFactory.createTestCampaign()
  })

  afterAll(async () => {
    await producer.disconnect()
    await consumer.disconnect()
  })

  test('should process campaign events through message queue', async () => {
    const testEvent = {
      type: 'VOTER_CONTACTED',
      campaignId: testCampaign.id,
      voterId: uuid(),
      contactMethod: 'phone',
      result: 'supporter',
      timestamp: new Date().toISOString()
    }

    // Subscribe to topic
    await consumer.subscribe({ topic: 'campaign-events' })
    
    const messagesReceived = []
    consumer.on('message', (message) => {
      messagesReceived.push(JSON.parse(message.value.toString()))
    })

    // Start consuming
    await consumer.run()

    // Produce event
    await producer.send({
      topic: 'campaign-events',
      messages: [{
        value: JSON.stringify(testEvent)
      }]
    })

    // Wait for message to be processed
    await waitForCondition(() => messagesReceived.length > 0, 5000)

    expect(messagesReceived.length).toBe(1)
    expect(messagesReceived[0]).toEqual(testEvent)
  })

  test('should handle batch event processing', async () => {
    const batchEvents = []
    for (let i = 0; i < 100; i++) {
      batchEvents.push({
        type: 'VOTER_CONTACTED',
        campaignId: testCampaign.id,
        voterId: uuid(),
        contactMethod: 'door',
        result: i % 3 === 0 ? 'supporter' : i % 3 === 1 ? 'undecided' : 'opposed',
        timestamp: new Date().toISOString()
      })
    }

    // Send batch
    await producer.sendBatch({
      topic: 'campaign-events',
      messages: batchEvents.map(event => ({
        value: JSON.stringify(event)
      }))
    })

    // Verify all events were processed
    await waitForCondition(
      async () => {
        const processedCount = await db.voter_contacts.count({
          where: { campaign_id: testCampaign.id }
        })
        return processedCount >= 100
      },
      10000
    )

    const finalCount = await db.voter_contacts.count({
      where: { campaign_id: testCampaign.id }
    })
    expect(finalCount).toBe(100)
  })
})
```

---

## Performance & Load Testing

### API Load Testing

#### 1. High-Volume Request Testing
```typescript
// test/integration/performance/api-load.test.ts
describe('API Load Testing', () => {
  let testCampaign: Campaign
  let authTokens: string[]

  beforeAll(async () => {
    testCampaign = await testDataFactory.createTestCampaign()
    
    // Create multiple test users for concurrent testing
    authTokens = []
    for (let i = 0; i < 50; i++) {
      const user = await testDataFactory.createTestUser()
      const token = await authService.generateToken(user.id)
      authTokens.push(token.token)
    }
  })

  test('should handle concurrent message generation requests', async () => {
    const concurrentRequests = 20
    const requestsPerUser = 5

    const startTime = Date.now()
    const promises = []

    for (let i = 0; i < concurrentRequests; i++) {
      const token = authTokens[i % authTokens.length]
      
      for (let j = 0; j < requestsPerUser; j++) {
        promises.push(
          request(app)
            .post('/api/messages/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({
              campaignId: testCampaign.id,
              platform: 'social_media',
              intent: 'promote_policy',
              versionProfile: 'general_public'
            })
        )
      }
    }

    const results = await Promise.allSettled(promises)
    const endTime = Date.now()

    // Verify performance metrics
    const totalRequests = concurrentRequests * requestsPerUser
    const successfulRequests = results.filter(r => r.status === 'fulfilled').length
    const avgResponseTime = (endTime - startTime) / totalRequests

    expect(successfulRequests).toBeGreaterThanOrEqual(totalRequests * 0.95) // 95% success rate
    expect(avgResponseTime).toBeLessThan(5000) // Average response time < 5 seconds

    console.log(`Load test results:`)
    console.log(`Total requests: ${totalRequests}`)
    console.log(`Successful: ${successfulRequests}`)
    console.log(`Success rate: ${(successfulRequests / totalRequests * 100).toFixed(2)}%`)
    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`)
  })

  test('should handle database query load', async () => {
    // Create large dataset
    const voters = []
    for (let i = 0; i < 1000; i++) {
      voters.push(testDataFactory.createTestVoter(testCampaign.id))
    }
    await db.voters.createMany({ data: voters })

    const concurrentQueries = 10
    const queriesPerConnection = 20

    const startTime = Date.now()
    const promises = []

    for (let i = 0; i < concurrentQueries; i++) {
      for (let j = 0; j < queriesPerConnection; j++) {
        promises.push(
          db.voters.findMany({
            where: {
              campaign_id: testCampaign.id,
              turnout_score: { gte: Math.random() * 100 }
            },
            take: 50,
            orderBy: { turnout_score: 'desc' }
          })
        )
      }
    }

    const results = await Promise.allSettled(promises)
    const endTime = Date.now()

    const totalQueries = concurrentQueries * queriesPerConnection
    const successfulQueries = results.filter(r => r.status === 'fulfilled').length
    const avgQueryTime = (endTime - startTime) / totalQueries

    expect(successfulQueries).toBe(totalQueries)
    expect(avgQueryTime).toBeLessThan(1000) // Average query time < 1 second

    console.log(`Database load test results:`)
    console.log(`Total queries: ${totalQueries}`)
    console.log(`Successful: ${successfulQueries}`)
    console.log(`Average query time: ${avgQueryTime.toFixed(2)}ms`)
  })
})
```

### Memory and Resource Testing

#### 1. Memory Leak Detection
```typescript
// test/integration/performance/memory-testing.test.ts
describe('Memory and Resource Testing', () => {
  test('should not have memory leaks in message processing', async () => {
    const initialMemory = process.memoryUsage()
    
    // Process many messages
    for (let i = 0; i < 1000; i++) {
      const message = await testDataFactory.createTestMessage(testCampaign.id)
      await aiService.processMessage(message.id)
      
      // Cleanup references
      if (i % 100 === 0) {
        global.gc?.() // Force garbage collection if --expose-gc is set
        
        const currentMemory = process.memoryUsage()
        const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed
        
        // Memory increase should be reasonable
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Less than 100MB increase
      }
    }
  })

  test('should handle large file uploads efficiently', async () => {
    // Create large CSV file (10MB)
    const largeData = []
    for (let i = 0; i < 100000; i++) {
      largeData.push(`${i},John${i},Doe${i},john${i}@example.com,555-${i.toString().padStart(4, '0')}`)
    }
    const csvContent = 'id,first_name,last_name,email,phone\n' + largeData.join('\n')
    const csvBuffer = Buffer.from(csvContent)

    const startTime = Date.now()
    const startMemory = process.memoryUsage()

    const uploadResult = await voterImportService.processLargeFile(
      testCampaign.id,
      csvBuffer,
      {
        chunkSize: 1000, // Process in chunks
        validateData: true
      }
    )

    const endTime = Date.now()
    const endMemory = process.memoryUsage()

    expect(uploadResult.success).toBe(true)
    expect(uploadResult.processed).toBe(100000)

    // Performance assertions
    const processingTime = endTime - startTime
    const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed

    expect(processingTime).toBeLessThan(60000) // Less than 1 minute
    expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024) // Less than 200MB memory increase
  })
})
```

---

## Security Testing

### Authentication & Authorization Testing

#### 1. Security Integration Tests
```typescript
// test/integration/security/auth-security.test.ts
describe('Security Integration Testing', () => {
  test('should prevent unauthorized access to campaign data', async () => {
    const campaign1 = await testDataFactory.createTestCampaign()
    const campaign2 = await testDataFactory.createTestCampaign()
    
    const user1 = await testDataFactory.createTestUser()
    const user2 = await testDataFactory.createTestUser()
    
    // Add user1 to campaign1 only
    await campaignService.addTeamMember(campaign1.id, user1.id, { role: 'admin' })
    
    const user1Token = await authService.generateToken(user1.id)
    const user2Token = await authService.generateToken(user2.id)

    // User1 should access campaign1 data
    const response1 = await request(app)
      .get(`/api/campaigns/${campaign1.id}/voters`)
      .set('Authorization', `Bearer ${user1Token.token}`)

    expect(response1.status).toBe(200)

    // User2 should NOT access campaign1 data
    const response2 = await request(app)
      .get(`/api/campaigns/${campaign1.id}/voters`)
      .set('Authorization', `Bearer ${user2Token.token}`)

    expect(response2.status).toBe(403)

    // User1 should NOT access campaign2 data
    const response3 = await request(app)
      .get(`/api/campaigns/${campaign2.id}/voters`)
      .set('Authorization', `Bearer ${user1Token.token}`)

    expect(response3.status).toBe(403)
  })

  test('should validate JWT token integrity', async () => {
    const validToken = await authService.generateToken(testUser.id)
    
    // Test with valid token
    const validResponse = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${validToken.token}`)

    expect(validResponse.status).toBe(200)

    // Test with tampered token
    const tamperedToken = validToken.token.slice(0, -5) + 'XXXXX'
    const tamperedResponse = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${tamperedToken}`)

    expect(tamperedResponse.status).toBe(401)

    // Test with expired token
    const expiredToken = jwt.sign(
      { userId: testUser.id, exp: Math.floor(Date.now() / 1000) - 3600 },
      process.env.JWT_SECRET
    )
    const expiredResponse = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${expiredToken}`)

    expect(expiredResponse.status).toBe(401)
  })

  test('should prevent SQL injection attacks', async () => {
    const maliciousInputs = [
      "'; DROP TABLE voters; --",
      "1' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; DELETE FROM campaigns; --"
    ]

    for (const maliciousInput of maliciousInputs) {
      const response = await request(app)
        .get('/api/voters/search')
        .query({ name: maliciousInput })
        .set('Authorization', `Bearer ${validToken}`)

      // Should either return safe results or proper error, never execute SQL
      expect(response.status).toBeOneOf([200, 400, 422])
      
      if (response.status === 200) {
        expect(Array.isArray(response.body.data)).toBe(true)
      }
    }

    // Verify database integrity after injection attempts
    const voterCount = await db.voters.count()
    const campaignCount = await db.campaigns.count()
    const userCount = await db.users.count()

    expect(voterCount).toBeGreaterThan(0)
    expect(campaignCount).toBeGreaterThan(0)
    expect(userCount).toBeGreaterThan(0)
  })
})
```

### Data Encryption Testing

#### 1. Encryption Integration Tests
```typescript
// test/integration/security/encryption.test.ts
describe('Data Encryption Integration', () => {
  test('should encrypt sensitive data at rest', async () => {
    const sensitiveData = {
      ssn: '123-45-6789',
      bankAccount: '1234567890',
      creditCard: '4111111111111111'
    }

    const voter = await testDataFactory.createTestVoter(testCampaign.id)
    
    // Store sensitive data
    await db.voter_sensitive_data.create({
      data: {
        voter_id: voter.id,
        encrypted_data: encryptionService.encrypt(JSON.stringify(sensitiveData))
      }
    })

    // Verify data is encrypted in database
    const rawData = await db.$queryRaw`
      SELECT encrypted_data FROM voter_sensitive_data WHERE voter_id = ${voter.id}
    `
    
    // Raw data should not contain plaintext sensitive information
    const rawString = rawData[0].encrypted_data
    expect(rawString).not.toContain('123-45-6789')
    expect(rawString).not.toContain('1234567890')
    expect(rawString).not.toContain('4111111111111111')

    // Verify decryption works correctly
    const decryptedData = JSON.parse(encryptionService.decrypt(rawString))
    expect(decryptedData).toEqual(sensitiveData)
  })

  test('should use TLS for all external API communications', async () => {
    const externalApis = [
      integrationConfig.externalApis.van.baseUrl,
      integrationConfig.externalApis.actblue.baseUrl,
      'https://api.openai.com'
    ]

    for (const apiUrl of externalApis) {
      expect(apiUrl).toMatch(/^https:\/\//)
      
      // Verify TLS certificate
      const { hostname } = new URL(apiUrl)
      const tlsSocket = await new Promise((resolve, reject) => {
        const socket = tls.connect(443, hostname, {
          rejectUnauthorized: true
        }, () => {
          resolve(socket)
        })
        socket.on('error', reject)
      })

      expect(tlsSocket.authorized).toBe(true)
      tlsSocket.destroy()
    }
  })
})
```

---

## Error Handling & Resilience Testing

### Failure Scenario Testing

#### 1. External Service Failure Handling
```typescript
// test/integration/resilience/service-failures.test.ts
describe('Service Failure Resilience', () => {
  test('should handle VAN API unavailability gracefully', async () => {
    // Mock VAN API to return errors
    nock(integrationConfig.externalApis.van.baseUrl)
      .get(/.*/)
      .times(3)
      .reply(503, { error: 'Service Unavailable' })
      .get(/.*/)
      .reply(200, { data: [] }) // Success after retries

    const syncResult = await voterSyncService.syncFromVAN(testCampaign.id)

    // Should eventually succeed with retries
    expect(syncResult.success).toBe(true)
    expect(syncResult.retryCount).toBe(3)
    expect(syncResult.errors.length).toBe(3) // Previous failures logged
  })

  test('should handle database connection failures', async () => {
    // Simulate database failure
    const originalDb = db
    const mockDb = {
      ...db,
      voters: {
        ...db.voters,
        findMany: jest.fn().mockRejectedValue(new Error('Connection failed'))
      }
    }

    // Replace database instance temporarily
    const voterService = new VoterService(mockDb)

    const result = await voterService.getVoters(testCampaign.id)

    // Should handle gracefully
    expect(result.success).toBe(false)
    expect(result.error).toContain('Connection failed')
    expect(result.retryAfter).toBeDefined()
  })

  test('should implement circuit breaker for failing services', async () => {
    const circuitBreaker = new CircuitBreaker(
      () => vanClient.getVoters(),
      {
        failureThreshold: 3,
        timeout: 5000,
        resetTimeout: 30000
      }
    )

    // Cause failures to trip circuit breaker
    nock(integrationConfig.externalApis.van.baseUrl)
      .get(/.*/)
      .times(5)
      .reply(500)

    // First 3 calls should reach the service and fail
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.call()
      } catch (error) {
        expect(error.message).toContain('500')
      }
    }

    // Circuit should now be open
    expect(circuitBreaker.state).toBe('OPEN')

    // Next calls should fail fast without hitting service
    try {
      await circuitBreaker.call()
    } catch (error) {
      expect(error.message).toContain('Circuit breaker is OPEN')
    }
  })
})
```

### Data Consistency Testing

#### 1. Transaction Rollback Testing
```typescript
// test/integration/resilience/transaction-consistency.test.ts
describe('Data Consistency and Transactions', () => {
  test('should maintain data consistency during failed voter import', async () => {
    const initialVoterCount = await db.voters.count({
      where: { campaign_id: testCampaign.id }
    })

    // Create CSV with some valid and some invalid data
    const mixedCsvData = `
VAN_ID,FirstName,LastName,Email
12345,John,Doe,john@example.com
12346,Jane,Smith,jane@example.com
INVALID,Bob,Wilson,not-an-email
12348,Alice,Johnson,alice@example.com
    `.trim()

    const result = await voterImportService.processVoterFile({
      campaignId: testCampaign.id,
      csvData: mixedCsvData,
      validateAll: true,
      rollbackOnError: true
    })

    // Import should fail due to invalid data
    expect(result.success).toBe(false)

    // Verify no partial data was saved
    const finalVoterCount = await db.voters.count({
      where: { campaign_id: testCampaign.id }
    })

    expect(finalVoterCount).toBe(initialVoterCount)
  })

  test('should handle concurrent access to same data', async () => {
    const voter = await testDataFactory.createTestVoter(testCampaign.id)
    
    // Simulate concurrent updates
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(
        db.voters.update({
          where: { id: voter.id },
          data: { 
            turnout_score: Math.floor(Math.random() * 100),
            updated_at: new Date()
          }
        })
      )
    }

    // All updates should complete without deadlocks
    const results = await Promise.allSettled(promises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    
    expect(successCount).toBeGreaterThan(0) // At least one should succeed
    
    // Final state should be consistent
    const finalVoter = await db.voters.findUnique({
      where: { id: voter.id }
    })
    
    expect(finalVoter).toBeDefined()
    expect(finalVoter.turnout_score).toBeGreaterThanOrEqual(0)
    expect(finalVoter.turnout_score).toBeLessThanOrEqual(100)
  })
})
```

---

## Automated Testing Pipelines

### CI/CD Integration Testing

#### 1. GitHub Actions Integration Test Pipeline
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: akashic_integration_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          
      kafka:
        image: confluentinc/cp-kafka:latest
        env:
          KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
          KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup test environment
      env:
        DATABASE_URL: postgres://postgres:testpass@localhost:5432/akashic_integration_test
        REDIS_URL: redis://localhost:6379/1
        KAFKA_BROKERS: localhost:9092
        OPENAI_API_KEY: ${{ secrets.OPENAI_TEST_API_KEY }}
        VAN_TEST_API_KEY: ${{ secrets.VAN_TEST_API_KEY }}
      run: |
        npm run db:migrate
        npm run db:seed:test
    
    - name: Run integration tests
      env:
        TEST_ENV: integration
        DATABASE_URL: postgres://postgres:testpass@localhost:5432/akashic_integration_test
        REDIS_URL: redis://localhost:6379/1
      run: |
        npm run test:integration -- --coverage --detectOpenHandles
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: integration
    
    - name: Archive test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: integration-test-results
        path: |
          test-results/
          coverage/
```

#### 2. Test Data Management
```typescript
// test/integration/setup/test-data-manager.ts
export class TestDataManager {
  private createdResources: Map<string, any[]> = new Map()

  async createTestEnvironment(): Promise<TestEnvironment> {
    // Create isolated test environment
    const environment = {
      campaigns: [],
      users: [],
      messages: [],
      voters: []
    }

    // Create test campaigns
    for (let i = 0; i < 3; i++) {
      const campaign = await this.createTestCampaign(`Test Campaign ${i + 1}`)
      environment.campaigns.push(campaign)
      this.trackResource('campaigns', campaign)
    }

    // Create test users with different roles
    const roles = ['campaign_manager', 'communications', 'field_director', 'finance']
    for (const role of roles) {
      const user = await this.createTestUser(role)
      environment.users.push(user)
      this.trackResource('users', user)
    }

    return environment
  }

  async cleanupTestEnvironment(): Promise<void> {
    // Clean up in reverse dependency order
    const cleanupOrder = ['messages', 'voters', 'campaigns', 'users']
    
    for (const resourceType of cleanupOrder) {
      const resources = this.createdResources.get(resourceType) || []
      
      for (const resource of resources) {
        try {
          await this.deleteResource(resourceType, resource.id)
        } catch (error) {
          console.warn(`Failed to cleanup ${resourceType} ${resource.id}:`, error.message)
        }
      }
    }

    this.createdResources.clear()
  }

  private trackResource(type: string, resource: any): void {
    if (!this.createdResources.has(type)) {
      this.createdResources.set(type, [])
    }
    this.createdResources.get(type)!.push(resource)
  }

  private async deleteResource(type: string, id: string): Promise<void> {
    switch (type) {
      case 'campaigns':
        await db.campaigns.delete({ where: { id } })
        break
      case 'users':
        await db.users.delete({ where: { id } })
        break
      case 'messages':
        await db.messages.delete({ where: { id } })
        break
      case 'voters':
        await db.voters.delete({ where: { id } })
        break
    }
  }
}
```

---

## Test Environment Management

### Environment Configuration

#### 1. Multi-Environment Testing Setup
```typescript
// test/config/environments.ts
export interface TestEnvironment {
  name: string
  database: {
    host: string
    port: number
    name: string
    schema: string
  }
  externalServices: {
    [key: string]: {
      baseUrl: string
      credentials: any
      mockEnabled: boolean
    }
  }
  features: {
    [feature: string]: boolean
  }
}

export const testEnvironments: Record<string, TestEnvironment> = {
  unit: {
    name: 'unit',
    database: {
      host: 'localhost',
      port: 5432,
      name: 'akashic_unit_test',
      schema: 'public'
    },
    externalServices: {
      van: { baseUrl: 'mock', credentials: {}, mockEnabled: true },
      actblue: { baseUrl: 'mock', credentials: {}, mockEnabled: true },
      openai: { baseUrl: 'mock', credentials: {}, mockEnabled: true }
    },
    features: {
      ai_processing: false,
      external_integrations: false,
      real_time_features: false
    }
  },
  
  integration: {
    name: 'integration',
    database: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      name: 'akashic_integration_test',
      schema: 'integration_test'
    },
    externalServices: {
      van: {
        baseUrl: process.env.VAN_TEST_URL || 'https://test-api.van.com',
        credentials: { apiKey: process.env.VAN_TEST_API_KEY },
        mockEnabled: false
      },
      actblue: {
        baseUrl: process.env.ACTBLUE_TEST_URL || 'https://test.actblue.com',
        credentials: {
          clientId: process.env.ACTBLUE_TEST_CLIENT_ID,
          clientSecret: process.env.ACTBLUE_TEST_CLIENT_SECRET
        },
        mockEnabled: false
      }
    },
    features: {
      ai_processing: true,
      external_integrations: true,
      real_time_features: true
    }
  },

  staging: {
    name: 'staging',
    database: {
      host: process.env.STAGING_DB_HOST || 'staging-db.akashic.ai',
      port: 5432,
      name: 'akashic_staging',
      schema: 'public'
    },
    externalServices: {
      van: {
        baseUrl: 'https://staging-api.van.com',
        credentials: { apiKey: process.env.VAN_STAGING_API_KEY },
        mockEnabled: false
      },
      actblue: {
        baseUrl: 'https://staging.actblue.com',
        credentials: {
          clientId: process.env.ACTBLUE_STAGING_CLIENT_ID,
          clientSecret: process.env.ACTBLUE_STAGING_CLIENT_SECRET
        },
        mockEnabled: false
      }
    },
    features: {
      ai_processing: true,
      external_integrations: true,
      real_time_features: true
    }
  }
}
```

#### 2. Environment Isolation and Cleanup
```typescript
// test/setup/environment-manager.ts
export class EnvironmentManager {
  private environment: TestEnvironment
  private isolationLevel: 'transaction' | 'database' | 'schema'
  private activeTransactions: any[] = []
  private createdSchemas: string[] = []

  constructor(environmentName: string, isolationLevel: 'transaction' | 'database' | 'schema' = 'schema') {
    this.environment = testEnvironments[environmentName]
    this.isolationLevel = isolationLevel
  }

  async setupIsolation(): Promise<string> {
    switch (this.isolationLevel) {
      case 'transaction':
        return await this.setupTransactionIsolation()
      case 'database':
        return await this.setupDatabaseIsolation()
      case 'schema':
        return await this.setupSchemaIsolation()
    }
  }

  private async setupSchemaIsolation(): Promise<string> {
    const schemaName = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create isolated schema
    await db.$executeRaw`CREATE SCHEMA ${Prisma.raw(schemaName)}`
    this.createdSchemas.push(schemaName)

    // Copy database structure to test schema
    await this.copyDatabaseStructure('public', schemaName)
    
    // Update database connection to use test schema
    await db.$executeRaw`SET search_path TO ${Prisma.raw(schemaName)}`

    return schemaName
  }

  private async copyDatabaseStructure(sourceSchema: string, targetSchema: string): Promise<void> {
    // Get all table definitions from source schema
    const tables = await db.$queryRaw<Array<{table_name: string}>>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ${sourceSchema}
      AND table_type = 'BASE TABLE'
    `)

    // Create tables in target schema
    for (const table of tables) {
      await db.$executeRaw`
        CREATE TABLE ${Prisma.raw(targetSchema)}.${Prisma.raw(table.table_name)} 
        (LIKE ${Prisma.raw(sourceSchema)}.${Prisma.raw(table.table_name)} INCLUDING ALL)
      `
    }

    // Copy sequences, indexes, and constraints
    await this.copyDatabaseConstraints(sourceSchema, targetSchema)
  }

  async teardownIsolation(): Promise<void> {
    // Rollback active transactions
    for (const transaction of this.activeTransactions) {
      try {
        await transaction.rollback()
      } catch (error) {
        console.warn('Failed to rollback transaction:', error.message)
      }
    }

    // Drop created schemas
    for (const schema of this.createdSchemas) {
      try {
        await db.$executeRaw`DROP SCHEMA ${Prisma.raw(schema)} CASCADE`
      } catch (error) {
        console.warn(`Failed to drop schema ${schema}:`, error.message)
      }
    }

    this.activeTransactions = []
    this.createdSchemas = []
  }

  async seedTestData(testSet: string): Promise<void> {
    const seedData = await this.loadSeedData(testSet)
    
    // Insert seed data in dependency order
    const insertOrder = ['users', 'organizations', 'campaigns', 'team_members', 'voters', 'messages']
    
    for (const entity of insertOrder) {
      if (seedData[entity]) {
        await this.insertSeedData(entity, seedData[entity])
      }
    }
  }

  private async loadSeedData(testSet: string): Promise<any> {
    const seedFilePath = path.join(__dirname, '../seeds', `${testSet}.json`)
    return JSON.parse(await fs.readFile(seedFilePath, 'utf8'))
  }
}
```

### Mock Service Management

#### 1. Dynamic Mock Server Setup
```typescript
// test/mocks/mock-server-manager.ts
export class MockServerManager {
  private servers: Map<string, MockServer> = new Map()
  private recordings: Map<string, Recording[]> = new Map()

  async startMockServer(serviceName: string, config: MockServerConfig): Promise<MockServer> {
    const server = new MockServer({
      port: config.port || this.getAvailablePort(),
      baseUrl: config.baseUrl,
      recordingMode: config.recordingMode || 'replay'
    })

    await server.start()
    this.servers.set(serviceName, server)

    // Load existing recordings if available
    const recordings = await this.loadRecordings(serviceName)
    if (recordings.length > 0) {
      server.loadRecordings(recordings)
    }

    return server
  }

  async recordInteractions(serviceName: string, testFunction: () => Promise<void>): Promise<void> {
    const server = this.servers.get(serviceName)
    if (!server) {
      throw new Error(`Mock server for ${serviceName} not found`)
    }

    // Enable recording mode
    server.setMode('record')
    server.clearRecordings()

    try {
      await testFunction()
    } finally {
      // Save recordings
      const recordings = server.getRecordings()
      await this.saveRecordings(serviceName, recordings)
      server.setMode('replay')
    }
  }

  async setupVANMock(): Promise<MockServer> {
    const vanServer = await this.startMockServer('van', {
      port: 8081,
      baseUrl: 'https://api.van.com'
    })

    // Setup common VAN API endpoints
    vanServer.addRoute({
      method: 'GET',
      path: '/people',
      response: (req) => ({
        status: 200,
        data: {
          items: this.generateMockVoters(req.query.limit || 10),
          pagination: {
            page: req.query.page || 1,
            total: 1000
          }
        }
      })
    })

    vanServer.addRoute({
      method: 'POST',
      path: '/people/*/canvassResponses',
      response: () => ({
        status: 201,
        data: { id: Date.now(), recorded: true }
      })
    })

    return vanServer
  }

  async setupActBlueMock(): Promise<MockServer> {
    const actblueServer = await this.startMockServer('actblue', {
      port: 8082,
      baseUrl: 'https://secure.actblue.com'
    })

    // Setup ActBlue API endpoints
    actblueServer.addRoute({
      method: 'POST',
      path: '/oauth/token',
      response: () => ({
        status: 200,
        data: {
          access_token: 'mock_access_token',
          token_type: 'Bearer',
          expires_in: 3600
        }
      })
    })

    actblueServer.addRoute({
      method: 'GET',
      path: '/api/v1/contributions',
      response: (req) => ({
        status: 200,
        data: {
          contributions: this.generateMockContributions(req.query.limit || 10),
          pagination: {
            page: req.query.page || 1,
            total: 500
          }
        }
      })
    })

    return actblueServer
  }

  private generateMockVoters(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      vanId: 100000 + i,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      addresses: [{
        streetNumber: faker.location.buildingNumber(),
        streetName: faker.location.street(),
        city: faker.location.city(),
        state: 'PA',
        zipCode: faker.location.zipCode()
      }],
      party: faker.helpers.arrayElement(['Democratic', 'Republican', 'Independent']),
      voterFileDownloadId: faker.string.uuid()
    }))
  }

  private generateMockContributions(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      contributionId: `mock_contrib_${Date.now()}_${i}`,
      amount: faker.number.int({ min: 500, max: 280000 }), // $5 to $2800 in cents
      donorFirstName: faker.person.firstName(),
      donorLastName: faker.person.lastName(),
      donorEmail: faker.internet.email(),
      donorAddress: {
        line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.stateAbbr(),
        zipCode: faker.location.zipCode()
      },
      contributedAt: faker.date.recent({ days: 30 }).toISOString(),
      employer: faker.company.name(),
      occupation: faker.person.jobTitle()
    }))
  }

  async stopAllServers(): Promise<void> {
    for (const [name, server] of this.servers.entries()) {
      try {
        await server.stop()
      } catch (error) {
        console.warn(`Failed to stop mock server ${name}:`, error.message)
      }
    }
    this.servers.clear()
  }
}
```

---

## Monitoring & Alerting Integration Tests

### Application Monitoring Integration

#### 1. Health Check Integration Tests
```typescript
// test/integration/monitoring/health-checks.test.ts
describe('Health Check Integration', () => {
  let healthCheckService: HealthCheckService

  beforeAll(async () => {
    healthCheckService = new HealthCheckService({
      checks: [
        'database',
        'redis',
        'external_apis',
        'message_queue',
        'ai_services'
      ]
    })
  })

  test('should perform comprehensive health checks', async () => {
    const healthResult = await healthCheckService.performHealthCheck()

    expect(healthResult.status).toBeOneOf(['healthy', 'degraded', 'unhealthy'])
    expect(healthResult.timestamp).toBeDefined()
    expect(healthResult.checks).toBeDefined()

    // Verify individual check results
    expect(healthResult.checks.database.status).toBeOneOf(['pass', 'fail'])
    expect(healthResult.checks.database.responseTime).toBeTypeOf('number')

    expect(healthResult.checks.redis.status).toBeOneOf(['pass', 'fail'])
    expect(healthResult.checks.external_apis.status).toBeOneOf(['pass', 'fail'])

    // Overall status should reflect component health
    if (healthResult.checks.database.status === 'fail') {
      expect(healthResult.status).toBeOneOf(['degraded', 'unhealthy'])
    }
  })

  test('should expose health check endpoint', async () => {
    const response = await request(app)
      .get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status')
    expect(response.body).toHaveProperty('timestamp')
    expect(response.body).toHaveProperty('checks')

    // Response time should be reasonable
    expect(response.duration).toBeLessThan(5000) // 5 seconds max
  })

  test('should provide detailed health information for authenticated requests', async () => {
    const adminToken = await authService.generateToken(adminUser.id, { roles: ['admin'] })

    const response = await request(app)
      .get('/health/detailed')
      .set('Authorization', `Bearer ${adminToken.token}`)

    expect(response.status).toBe(200)
    expect(response.body.checks).toBeDefined()

    // Detailed response should include metrics
    expect(response.body.metrics).toBeDefined()
    expect(response.body.metrics.uptime).toBeTypeOf('number')
    expect(response.body.metrics.memoryUsage).toBeDefined()
    expect(response.body.metrics.activeConnections).toBeTypeOf('number')
  })

  test('should handle health check failures gracefully', async () => {
    // Simulate database failure
    await db.$disconnect()

    const healthResult = await healthCheckService.performHealthCheck()

    expect(healthResult.status).toBe('unhealthy')
    expect(healthResult.checks.database.status).toBe('fail')
    expect(healthResult.checks.database.error).toBeDefined()

    // Reconnect for other tests
    await db.$connect()
  })
})
```

#### 2. Metrics Collection Integration
```typescript
// test/integration/monitoring/metrics-collection.test.ts
describe('Metrics Collection Integration', () => {
  let metricsCollector: MetricsCollector
  let prometheusRegistry: Registry

  beforeAll(async () => {
    prometheusRegistry = new Registry()
    metricsCollector = new MetricsCollector(prometheusRegistry)
  })

  test('should collect application performance metrics', async () => {
    // Generate some activity
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/messages/generate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          campaignId: testCampaign.id,
          platform: 'social_media',
          intent: 'test'
        })
    }

    // Collect metrics
    const metrics = await prometheusRegistry.metrics()

    // Verify HTTP request metrics
    expect(metrics).toContain('http_requests_total')
    expect(metrics).toContain('http_request_duration_seconds')

    // Verify application-specific metrics
    expect(metrics).toContain('messages_generated_total')
    expect(metrics).toContain('ai_processing_duration_seconds')
    expect(metrics).toContain('database_queries_total')
  })

  test('should track business metrics', async () => {
    // Generate business activity
    const voter = await testDataFactory.createTestVoter(testCampaign.id)
    await voterService.recordContact(voter.id, {
      method: 'phone',
      result: 'supporter',
      notes: 'Test contact'
    })

    const metrics = await prometheusRegistry.metrics()

    // Verify business metrics are collected
    expect(metrics).toContain('voter_contacts_total')
    expect(metrics).toContain('campaigns_active_total')
    expect(metrics).toContain('users_active_total')
  })

  test('should expose metrics endpoint', async () => {
    const response = await request(app)
      .get('/metrics')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('text/plain')
    expect(response.text).toContain('# HELP')
    expect(response.text).toContain('# TYPE')
  })
})
```

### Error Tracking Integration

#### 1. Sentry Integration Tests
```typescript
// test/integration/monitoring/error-tracking.test.ts
describe('Error Tracking Integration', () => {
  let sentryTestClient: SentryTestClient

  beforeAll(async () => {
    sentryTestClient = new SentryTestClient({
      dsn: process.env.SENTRY_TEST_DSN,
      environment: 'test'
    })
  })

  test('should capture and report application errors', async () => {
    const testError = new Error('Test integration error')
    testError.stack = 'Error: Test integration error\n    at test (/test/file.js:1:1)'

    // Trigger error in application
    Sentry.captureException(testError, {
      tags: {
        test: 'integration',
        component: 'error-tracking'
      },
      extra: {
        testData: { userId: testUser.id }
      }
    })

    // Wait for error to be sent
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify error was captured
    const capturedErrors = await sentryTestClient.getCapturedErrors()
    const testErrorEntry = capturedErrors.find(error => 
      error.message === 'Test integration error'
    )

    expect(testErrorEntry).toBeDefined()
    expect(testErrorEntry.tags.test).toBe('integration')
    expect(testErrorEntry.tags.component).toBe('error-tracking')
  })

  test('should capture API errors with context', async () => {
    // Trigger API error
    const response = await request(app)
      .get('/api/campaigns/invalid-id')
      .set('Authorization', `Bearer ${validToken}`)

    expect(response.status).toBe(404)

    // Verify error was captured with context
    await new Promise(resolve => setTimeout(resolve, 1000))
    const capturedErrors = await sentryTestClient.getCapturedErrors()
    
    const apiError = capturedErrors.find(error => 
      error.message.includes('Campaign not found')
    )

    expect(apiError).toBeDefined()
    expect(apiError.request).toBeDefined()
    expect(apiError.request.url).toContain('/api/campaigns/invalid-id')
    expect(apiError.user).toBeDefined()
  })

  test('should respect error filtering rules', async () => {
    // Trigger a filtered error (should not be reported)
    const ignoredError = new Error('Test validation error')
    ignoredError.name = 'ValidationError'

    Sentry.captureException(ignoredError)

    await new Promise(resolve => setTimeout(resolve, 1000))

    const capturedErrors = await sentryTestClient.getCapturedErrors()
    const ignoredErrorEntry = capturedErrors.find(error => 
      error.message === 'Test validation error'
    )

    // Validation errors should be filtered out
    expect(ignoredErrorEntry).toBeUndefined()
  })
})
```

### Logging Integration

#### 1. Structured Logging Tests
```typescript
// test/integration/monitoring/logging.test.ts
describe('Logging Integration', () => {
  let logCapture: LogCapture

  beforeAll(async () => {
    logCapture = new LogCapture()
    logCapture.start()
  })

  afterAll(async () => {
    logCapture.stop()
  })

  test('should log structured application events', async () => {
    // Trigger logged events
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        campaignId: testCampaign.id,
        title: 'Test Message',
        content: 'Test content',
        platform: 'social_media'
      })

    const logs = logCapture.getLogs()
    const messageCreatedLog = logs.find(log => 
      log.event === 'message_created'
    )

    expect(messageCreatedLog).toBeDefined()
    expect(messageCreatedLog.level).toBe('info')
    expect(messageCreatedLog.userId).toBe(testUser.id)
    expect(messageCreatedLog.campaignId).toBe(testCampaign.id)
    expect(messageCreatedLog.timestamp).toBeDefined()
  })

  test('should log security events', async () => {
    // Trigger security event (failed login)
    await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrong-password'
      })

    const logs = logCapture.getLogs()
    const securityLog = logs.find(log => 
      log.event === 'auth_failure'
    )

    expect(securityLog).toBeDefined()
    expect(securityLog.level).toBe('warn')
    expect(securityLog.email).toBe(testUser.email)
    expect(securityLog.ip).toBeDefined()
    expect(securityLog.userAgent).toBeDefined()
  })

  test('should include correlation IDs in logs', async () => {
    const correlationId = uuid()

    await request(app)
      .get('/api/campaigns')
      .set('Authorization', `Bearer ${validToken}`)
      .set('X-Correlation-ID', correlationId)

    const logs = logCapture.getLogs()
    const requestLogs = logs.filter(log => 
      log.correlationId === correlationId
    )

    expect(requestLogs.length).toBeGreaterThan(0)
    
    // All logs in the request should have the same correlation ID
    for (const log of requestLogs) {
      expect(log.correlationId).toBe(correlationId)
    }
  })
})
```

---

## Performance Benchmarks & KPIs

### Performance Testing Benchmarks

#### 1. API Response Time Benchmarks
```typescript
// test/integration/performance/benchmarks.test.ts
describe('Performance Benchmarks', () => {
  const benchmarks = {
    api: {
      auth: { target: 200, max: 500 }, // ms
      messageGeneration: { target: 3000, max: 5000 },
      voterSearch: { target: 500, max: 1000 },
      campaignDashboard: { target: 1000, max: 2000 }
    },
    database: {
      simpleQuery: { target: 50, max: 100 }, // ms
      complexQuery: { target: 200, max: 500 },
      batchInsert: { target: 1000, max: 2000 }
    },
    external: {
      vanApiCall: { target: 2000, max: 5000 }, // ms
      actblueSync: { target: 3000, max: 8000 },
      aiProcessing: { target: 5000, max: 10000 }
    }
  }

  test('should meet API response time benchmarks', async () => {
    const results = new Map<string, number>()

    // Test authentication endpoint
    const authStart = Date.now()
    await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'password' })
    results.set('auth', Date.now() - authStart)

    // Test message generation
    const messageStart = Date.now()
    await request(app)
      .post('/api/messages/generate')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        campaignId: testCampaign.id,
        platform: 'social_media',
        intent: 'test'
      })
    results.set('messageGeneration', Date.now() - messageStart)

    // Test voter search
    const searchStart = Date.now()
    await request(app)
      .get('/api/voters/search')
      .query({ q: 'John', limit: 20 })
      .set('Authorization', `Bearer ${validToken}`)
    results.set('voterSearch', Date.now() - searchStart)

    // Verify benchmarks
    for (const [endpoint, responseTime] of results.entries()) {
      const benchmark = benchmarks.api[endpoint]
      
      console.log(`${endpoint}: ${responseTime}ms (target: ${benchmark.target}ms, max: ${benchmark.max}ms)`)
      
      expect(responseTime).toBeLessThan(benchmark.max)
      
      if (responseTime > benchmark.target) {
        console.warn(`⚠️  ${endpoint} exceeded target response time`)
      }
    }
  })

  test('should meet database performance benchmarks', async () => {
    const results = new Map<string, number>()

    // Simple query benchmark
    const simpleStart = Date.now()
    await db.users.findUnique({ where: { id: testUser.id } })
    results.set('simpleQuery', Date.now() - simpleStart)

    // Complex query benchmark  
    const complexStart = Date.now()
    await db.voters.findMany({
      where: {
        campaign_id: testCampaign.id,
        turnout_score: { gte: 75 },
        persuasion_score: { gte: 50 }
      },
      include: {
        contacts: {
          where: { contact_date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        }
      },
      orderBy: [
        { turnout_score: 'desc' },
        { persuasion_score: 'desc' }
      ],
      take: 100
    })
    results.set('complexQuery', Date.now() - complexStart)

    // Batch insert benchmark
    const batchData = Array.from({ length: 100 }, () => 
      testDataFactory.createTestVoterData(testCampaign.id)
    )
    
    const batchStart = Date.now()
    await db.voters.createMany({ data: batchData })
    results.set('batchInsert', Date.now() - batchStart)

    // Verify benchmarks
    for (const [operation, duration] of results.entries()) {
      const benchmark = benchmarks.database[operation]
      
      console.log(`DB ${operation}: ${duration}ms (target: ${benchmark.target}ms, max: ${benchmark.max}ms)`)
      
      expect(duration).toBeLessThan(benchmark.max)
    }
  })

  test('should track and report performance degradation', async () => {
    const performanceMonitor = new PerformanceMonitor()
    
    // Run baseline performance test
    const baseline = await performanceMonitor.runBaseline()
    
    // Run current performance test
    const current = await performanceMonitor.runCurrent()
    
    // Calculate performance delta
    const delta = performanceMonitor.calculateDelta(baseline, current)
    
    // Report significant degradations
    for (const [metric, change] of Object.entries(delta)) {
      if (change.percentageIncrease > 20) {
        console.warn(`⚠️  Performance degradation detected in ${metric}: ${change.percentageIncrease.toFixed(1)}% slower`)
      }
    }
    
    // Fail test if critical metrics degraded significantly
    expect(delta.auth?.percentageIncrease || 0).toBeLessThan(50)
    expect(delta.messageGeneration?.percentageIncrease || 0).toBeLessThan(30)
  })
})
```

### Integration Test KPIs

#### 1. Test Quality Metrics
```typescript
// test/integration/quality/test-metrics.test.ts
describe('Integration Test Quality Metrics', () => {
  test('should maintain test coverage above thresholds', async () => {
    const coverage = await getCoverageReport('integration')
    
    expect(coverage.lines.pct).toBeGreaterThanOrEqual(80)
    expect(coverage.functions.pct).toBeGreaterThanOrEqual(85)
    expect(coverage.branches.pct).toBeGreaterThanOrEqual(75)
    expect(coverage.statements.pct).toBeGreaterThanOrEqual(80)
    
    console.log('Integration Test Coverage:')
    console.log(`Lines: ${coverage.lines.pct}%`)
    console.log(`Functions: ${coverage.functions.pct}%`)
    console.log(`Branches: ${coverage.branches.pct}%`)
    console.log(`Statements: ${coverage.statements.pct}%`)
  })

  test('should have reasonable test execution times', async () => {
    const testMetrics = await getTestExecutionMetrics()
    
    // Individual test thresholds
    expect(testMetrics.averageTestDuration).toBeLessThan(5000) // 5 seconds
    expect(testMetrics.slowestTest.duration).toBeLessThan(30000) // 30 seconds
    
    // Suite thresholds
    expect(testMetrics.totalSuiteDuration).toBeLessThan(600000) // 10 minutes
    
    // Identify slow tests
    const slowTests = testMetrics.tests.filter(test => test.duration > 10000)
    if (slowTests.length > 0) {
      console.warn('Slow tests detected:')
      slowTests.forEach(test => {
        console.warn(`- ${test.name}: ${test.duration}ms`)
      })
    }
  })

  test('should maintain test reliability', async () => {
    const reliabilityMetrics = await getTestReliabilityMetrics()
    
    // Flaky test detection
    expect(reliabilityMetrics.flakyTestCount).toBeLessThan(5)
    expect(reliabilityMetrics.overallPassRate).toBeGreaterThanOrEqual(0.95) // 95%
    
    // Resource cleanup verification
    expect(reliabilityMetrics.resourceLeaks).toBe(0)
    expect(reliabilityMetrics.memoryLeaks).toBe(0)
    
    if (reliabilityMetrics.flakyTests.length > 0) {
      console.warn('Flaky tests detected:')
      reliabilityMetrics.flakyTests.forEach(test => {
        console.warn(`- ${test.name}: ${test.failureRate}% failure rate`)
      })
    }
  })
})
```

---

## Troubleshooting Guide

### Common Integration Test Issues

#### 1. External Service Connection Problems
```typescript
// test/integration/troubleshooting/connection-issues.test.ts
describe('Connection Issue Troubleshooting', () => {
  test('should diagnose VAN API connection issues', async () => {
    const diagnostics = new ConnectionDiagnostics()
    
    const vanDiagnostic = await diagnostics.diagnoseVAN({
      apiKey: integrationConfig.externalApis.van.apiKey,
      baseUrl: integrationConfig.externalApis.van.baseUrl
    })
    
    if (!vanDiagnostic.success) {
      console.log('VAN Connection Diagnostic Results:')
      console.log(`- Network connectivity: ${vanDiagnostic.networkConnectivity ? '✓' : '✗'}`)
      console.log(`- DNS resolution: ${vanDiagnostic.dnsResolution ? '✓' : '✗'}`)
      console.log(`- SSL certificate: ${vanDiagnostic.sslCertificate ? '✓' : '✗'}`)
      console.log(`- Authentication: ${vanDiagnostic.authentication ? '✓' : '✗'}`)
      console.log(`- API permissions: ${vanDiagnostic.apiPermissions ? '✓' : '✗'}`)
      
      // Provide specific recommendations
      vanDiagnostic.recommendations.forEach(rec => {
        console.log(`💡 ${rec}`)
      })
    }
    
    expect(vanDiagnostic.success).toBe(true)
  })

  test('should diagnose database connection issues', async () => {
    const dbDiagnostic = await diagnostics.diagnoseDatabase()
    
    if (!dbDiagnostic.success) {
      console.log('Database Connection Diagnostic Results:')
      console.log(`- Host reachable: ${dbDiagnostic.hostReachable ? '✓' : '✗'}`)
      console.log(`- Port accessible: ${dbDiagnostic.portAccessible ? '✓' : '✗'}`)
      console.log(`- Credentials valid: ${dbDiagnostic.credentialsValid ? '✓' : '✗'}`)
      console.log(`- Database exists: ${dbDiagnostic.databaseExists ? '✓' : '✗'}`)
      console.log(`- Schema current: ${dbDiagnostic.schemaCurrent ? '✓' : '✗'}`)
    }
    
    expect(dbDiagnostic.success).toBe(true)
  })
})
```

#### 2. Test Environment Issues
```typescript
// test/integration/troubleshooting/environment-issues.test.ts
describe('Environment Issue Troubleshooting', () => {
  test('should validate test environment configuration', async () => {
    const envValidator = new EnvironmentValidator()
    const validation = await envValidator.validateEnvironment()
    
    if (!validation.valid) {
      console.log('Environment Validation Issues:')
      validation.issues.forEach(issue => {
        console.log(`❌ ${issue.category}: ${issue.description}`)
        if (issue.solution) {
          console.log(`   💡 Solution: ${issue.solution}`)
        }
      })
    }
    
    expect(validation.valid).toBe(true)
  })

  test('should check resource availability', async () => {
    const resourceChecker = new ResourceChecker()
    const resources = await resourceChecker.checkResources()
    
    expect(resources.memory.available).toBeGreaterThan(500 * 1024 * 1024) // 500MB
    expect(resources.disk.available).toBeGreaterThan(1 * 1024 * 1024 * 1024) // 1GB
    expect(resources.ports.available).toContain(5432) // PostgreSQL
    expect(resources.ports.available).toContain(6379) // Redis
    
    if (resources.warnings.length > 0) {
      console.warn('Resource Warnings:')
      resources.warnings.forEach(warning => {
        console.warn(`⚠️  ${warning}`)
      })
    }
  })
})
```

### Integration Test Best Practices

#### 1. Test Reliability Best Practices
```markdown
## Integration Test Best Practices

### 1. Test Isolation
- Use database transactions or schema isolation
- Clean up resources after each test
- Avoid shared state between tests
- Use unique test data identifiers

### 2. External Service Handling
- Always use test/staging environments
- Implement proper retry logic
- Mock unreliable services
- Set appropriate timeouts

### 3. Performance Considerations
- Run tests in parallel when possible
- Use connection pooling
- Implement proper resource cleanup
- Monitor test execution times

### 4. Error Handling
- Expect and handle service failures
- Implement graceful degradation
- Log detailed error information
- Provide clear failure messages

### 5. Data Management
- Use factories for test data creation
- Implement proper cleanup strategies
- Version control test datasets
- Maintain data consistency
```

---

## Conclusion

This comprehensive Integration Testing Guide provides a robust framework for ensuring the Akashic Intelligence Campaign Console functions seamlessly across all its integrated components. The testing strategy covers:

### Key Benefits

1. **Comprehensive Coverage**: Tests all integration points from external APIs to internal services
2. **Reliability Assurance**: Implements resilience testing and error handling validation
3. **Performance Monitoring**: Establishes benchmarks and tracks performance degradation
4. **Security Validation**: Ensures secure data handling and proper authentication
5. **Automated Quality Control**: Continuous integration with automated test execution

### Implementation Recommendations

1. **Phased Rollout**: Implement integration tests incrementally, starting with critical paths
2. **Environment Parity**: Maintain consistent test environments matching production
3. **Continuous Monitoring**: Track test metrics and performance over time
4. **Team Training**: Ensure all developers understand integration testing practices
5. **Regular Maintenance**: Keep tests updated with application changes

### Success Metrics

- **Test Coverage**: Maintain >80% integration test coverage
- **Test Reliability**: Achieve >95% test pass rate
- **Performance**: Keep test suite execution under 10 minutes
- **Issue Detection**: Catch integration issues before production deployment
- **Team Velocity**: Enable faster, more confident deployments

By following this guide, the Akashic Intelligence team can ensure robust, reliable integrations that support Democratic campaigns with confidence and effectiveness. The comprehensive testing approach provides the foundation for a platform that campaigns can depend on during critical election periods.

### Next Steps

1. Implement the testing framework using the provided code examples
2. Set up CI/CD pipelines with integration test automation
3. Establish monitoring and alerting for test failures
4. Create team documentation and training materials
5. Begin regular performance and reliability reporting

This testing strategy ensures that the Akashic Intelligence Campaign Console delivers on its promise of providing "The Key to Comprehensive Political Understanding" through reliable, well-tested integrations and robust system performance.