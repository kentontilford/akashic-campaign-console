# Akashic Intelligence - API Documentation & Reference

## Overview

This comprehensive API documentation provides detailed information about all endpoints, authentication methods, request/response formats, and integration patterns for the Akashic Intelligence Campaign Console platform.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [User Management API](#user-management-api)
4. [Campaign Management API](#campaign-management-api)
5. [Message Generation API](#message-generation-api)
6. [Team Management API](#team-management-api)
7. [Data Import/Export API](#data-importexport-api)
8. [Analytics API](#analytics-api)
9. [Webhook API](#webhook-api)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [SDK & Libraries](#sdk--libraries)

---

## API Overview

### Base URL

```
Production: https://app.akashicintelligence.com/api
Staging: https://staging.akashicintelligence.com/api
Development: https://dev.akashicintelligence.com/api
```

### API Versioning

The API uses URL path versioning:

```
https://app.akashicintelligence.com/api/v1/
```

### Content Types

- **Request**: `application/json`
- **Response**: `application/json`
- **File Upload**: `multipart/form-data`

### HTTP Methods

- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT` - Update existing resources
- `PATCH` - Partial updates
- `DELETE` - Remove resources

### Response Format

All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "requestId": "req_abc123"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "requestId": "req_abc123"
  }
}
```

---

## Authentication

### Authentication Methods

The API supports multiple authentication methods:

1. **JWT Tokens** (Recommended for web applications)
2. **API Keys** (For server-to-server integration)
3. **OAuth 2.0** (For third-party applications)

### JWT Authentication

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "rt_abc123def456",
      "expiresIn": 3600
    }
  }
}
```

#### Using JWT Tokens

Include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "rt_abc123def456"
}
```

### API Key Authentication

#### Generate API Key

```http
POST /api/v1/auth/api-keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Integration API Key",
  "permissions": ["campaigns:read", "messages:write"],
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "ak_123",
    "name": "Integration API Key",
    "key": "ak_live_1234567890abcdef",
    "permissions": ["campaigns:read", "messages:write"],
    "createdAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

#### Using API Keys

Include the API key in the Authorization header:

```http
Authorization: Bearer ak_live_1234567890abcdef
```

### OAuth 2.0 Flow

#### Authorization URL

```
https://app.akashicintelligence.com/oauth/authorize?
  response_type=code&
  client_id=your_client_id&
  redirect_uri=https://your-app.com/callback&
  scope=campaigns:read messages:write&
  state=random_state_string
```

#### Exchange Code for Token

```http
POST /api/v1/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=auth_code_from_callback&
client_id=your_client_id&
client_secret=your_client_secret&
redirect_uri=https://your-app.com/callback
```

---

## User Management API

### Get Current User

```http
GET /api/v1/user/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-15T10:30:00Z",
    "preferences": {
      "theme": "light",
      "notifications": {
        "email": true,
        "push": false
      }
    }
  }
}
```

### Update User Profile

```http
PATCH /api/v1/user/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": true
    }
  }
}
```

### Upload Avatar

```http
POST /api/v1/user/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "avatar": <file>
}
```

### Change Password

```http
POST /api/v1/user/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## Campaign Management API

### List Campaigns

```http
GET /api/v1/campaigns?page=1&limit=20&sort=createdAt&order=desc
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | 1 |
| `limit` | integer | Items per page (max 100) | 20 |
| `sort` | string | Sort field | `createdAt` |
| `order` | string | Sort order (`asc`, `desc`) | `desc` |
| `type` | string | Campaign type filter | - |
| `state` | string | State filter | - |
| `status` | string | Status filter | - |

**Response:**

```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "camp_123",
        "name": "PA-01 Congressional Campaign",
        "slug": "pa-01-congressional",
        "type": "federal_house",
        "state": "PA",
        "district": "1",
        "status": "active",
        "electionDate": "2024-11-05T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "stats": {
          "totalMessages": 150,
          "teamMembers": 8,
          "votersCount": 25000
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Get Campaign Details

```http
GET /api/v1/campaigns/camp_123
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "camp_123",
    "name": "PA-01 Congressional Campaign",
    "slug": "pa-01-congressional",
    "type": "federal_house",
    "state": "PA",
    "district": "1",
    "status": "active",
    "description": "Campaign for Pennsylvania's 1st Congressional District",
    "electionDate": "2024-11-05T00:00:00Z",
    "profile": {
      "values": ["healthcare", "education", "economy"],
      "keyIssues": {
        "healthcare": {
          "priority": "high",
          "talkingPoints": [
            "Expand access to affordable healthcare",
            "Protect pre-existing conditions"
          ]
        }
      },
      "targetAudiences": ["working_families", "seniors", "young_professionals"]
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "createdBy": {
      "id": "user_123",
      "name": "Campaign Manager",
      "role": "owner"
    }
  }
}
```

### Create Campaign

```http
POST /api/v1/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "CA-10 Congressional Campaign",
  "type": "federal_house",
  "state": "CA",
  "district": "10",
  "electionDate": "2024-11-05",
  "description": "Campaign for California's 10th Congressional District",
  "profile": {
    "values": ["climate", "technology", "equality"],
    "keyIssues": {
      "climate": {
        "priority": "high",
        "talkingPoints": [
          "Green New Deal implementation",
          "Clean energy jobs"
        ]
      }
    }
  }
}
```

### Update Campaign

```http
PATCH /api/v1/campaigns/camp_123
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated campaign description",
  "profile": {
    "values": ["healthcare", "education", "economy", "climate"],
    "keyIssues": {
      "climate": {
        "priority": "medium",
        "talkingPoints": ["Environmental protection", "Clean energy transition"]
      }
    }
  }
}
```

### Delete Campaign

```http
DELETE /api/v1/campaigns/camp_123
Authorization: Bearer <token>
```

---

## Message Generation API

### Generate Message

```http
POST /api/v1/campaigns/camp_123/messages/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "social_media_post",
  "audience": "general_public",
  "environment": "social_media",
  "intent": "Promote healthcare policy position",
  "tone": "optimistic",
  "context": "Upcoming town hall on healthcare",
  "length": "medium"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Message type (see enum below) |
| `audience` | string | Yes | Target audience (see enum below) |
| `environment` | string | Yes | Where message will be used |
| `intent` | string | Yes | Purpose of the message |
| `tone` | string | No | Desired tone (default: "balanced") |
| `context` | string | No | Additional context |
| `length` | string | No | Message length ("short", "medium", "long") |

**Message Types:**
- `social_media_post`
- `speech`
- `email`
- `press_release`
- `fundraising_email`
- `volunteer_recruitment`
- `policy_statement`

**Audiences:**
- `general_public`
- `supporters`
- `undecided_voters`
- `donors`
- `volunteers`
- `media`
- `legislators`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "msg_456",
    "content": "Healthcare is a fundamental right that every American deserves. Our comprehensive plan will expand access to affordable care while protecting pre-existing conditions. Join us at tonight's town hall to learn more about our vision for accessible healthcare. #HealthcareForAll",
    "type": "social_media_post",
    "audience": "general_public",
    "environment": "social_media",
    "metadata": {
      "wordCount": 45,
      "characterCount": 280,
      "estimatedReadTime": "15 seconds",
      "themes": ["healthcare", "accessibility", "community_engagement"],
      "aiModel": "gpt-4",
      "generationTime": 3.2
    },
    "riskAnalysis": {
      "overallScore": 0.15,
      "flags": [],
      "suggestions": []
    },
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### List Messages

```http
GET /api/v1/campaigns/camp_123/messages?page=1&limit=20&status=all
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | 1 |
| `limit` | integer | Items per page | 20 |
| `status` | string | Filter by status | `all` |
| `type` | string | Filter by message type | - |
| `audience` | string | Filter by audience | - |
| `createdBy` | string | Filter by creator | - |

**Response:**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_456",
        "content": "Healthcare is a fundamental right...",
        "type": "social_media_post",
        "audience": "general_public",
        "status": "approved",
        "createdAt": "2024-01-15T10:30:00Z",
        "createdBy": {
          "id": "user_123",
          "name": "Content Creator"
        },
        "riskAnalysis": {
          "overallScore": 0.15
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Get Message Details

```http
GET /api/v1/campaigns/camp_123/messages/msg_456
Authorization: Bearer <token>
```

### Update Message

```http
PATCH /api/v1/campaigns/camp_123/messages/msg_456
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated message content...",
  "notes": "Revised based on team feedback"
}
```

### Approve/Reject Message

```http
POST /api/v1/campaigns/camp_123/messages/msg_456/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true,
  "notes": "Approved for publication"
}
```

### Analyze Message Risk

```http
POST /api/v1/campaigns/camp_123/messages/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Message content to analyze...",
  "type": "social_media_post",
  "audience": "general_public"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "riskScore": 0.25,
    "flags": [
      {
        "type": "potential_controversy",
        "severity": "low",
        "description": "Contains potentially divisive language",
        "suggestion": "Consider more inclusive phrasing"
      }
    ],
    "suggestions": [
      "Consider adding a call-to-action",
      "Message could benefit from more specific policy details"
    ],
    "sentiment": {
      "overall": "positive",
      "confidence": 0.85
    },
    "readability": {
      "score": 8.2,
      "level": "high school"
    }
  }
}
```

---

## Team Management API

### List Team Members

```http
GET /api/v1/campaigns/camp_123/team
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "tm_789",
        "user": {
          "id": "user_123",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "https://example.com/avatar.jpg"
        },
        "role": "owner",
        "permissions": ["all"],
        "joinedAt": "2024-01-01T00:00:00Z",
        "lastActiveAt": "2024-01-15T10:30:00Z",
        "status": "active"
      }
    ]
  }
}
```

### Invite Team Member

```http
POST /api/v1/campaigns/camp_123/team/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "content_creator",
  "customPermissions": ["messages:create", "messages:edit"],
  "message": "Welcome to our campaign team!"
}
```

### Update Team Member Role

```http
PATCH /api/v1/campaigns/camp_123/team/tm_789
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "campaign_manager",
  "customPermissions": ["messages:approve", "team:invite"]
}
```

### Remove Team Member

```http
DELETE /api/v1/campaigns/camp_123/team/tm_789
Authorization: Bearer <token>
```

---

## Data Import/Export API

### Import Voter Data

```http
POST /api/v1/campaigns/camp_123/data/import/voters
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <csv_file>,
  "mapping": {
    "email": "email_address",
    "firstName": "first_name",
    "lastName": "last_name",
    "phone": "phone_number",
    "address": "street_address"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "importId": "imp_123",
    "status": "processing",
    "summary": {
      "totalRows": 1000,
      "validRows": 950,
      "invalidRows": 50
    },
    "estimatedCompletion": "2024-01-15T10:35:00Z"
  }
}
```

### Check Import Status

```http
GET /api/v1/campaigns/camp_123/data/imports/imp_123
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "imp_123",
    "status": "completed",
    "summary": {
      "totalRows": 1000,
      "processedRows": 1000,
      "createdRecords": 900,
      "updatedRecords": 50,
      "skippedRows": 50,
      "errorRows": 0
    },
    "errors": [],
    "completedAt": "2024-01-15T10:34:00Z"
  }
}
```

### Export Campaign Data

```http
POST /api/v1/campaigns/camp_123/data/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "voters",
  "format": "csv",
  "filters": {
    "status": "active",
    "createdAfter": "2024-01-01T00:00:00Z"
  },
  "fields": ["email", "firstName", "lastName", "phone", "registrationDate"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "exportId": "exp_456",
    "status": "processing",
    "estimatedCompletion": "2024-01-15T10:35:00Z"
  }
}
```

### Download Export

```http
GET /api/v1/campaigns/camp_123/data/exports/exp_456/download
Authorization: Bearer <token>
```

---

## Analytics API

### Campaign Analytics

```http
GET /api/v1/campaigns/camp_123/analytics?timeframe=30d&metrics=messages,engagement,team_activity
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `timeframe` | string | Time period (1d, 7d, 30d, 90d) | 30d |
| `metrics` | string | Comma-separated metrics | all |

**Response:**

```json
{
  "success": true,
  "data": {
    "timeframe": "30d",
    "summary": {
      "totalMessages": 150,
      "averageGenerationTime": 4.2,
      "approvalRate": 0.85,
      "teamActivity": {
        "activeMembers": 6,
        "totalActions": 342
      }
    },
    "trends": {
      "messageGeneration": [
        {
          "date": "2024-01-01",
          "count": 5
        }
      ],
      "userEngagement": [
        {
          "date": "2024-01-01",
          "activeUsers": 3
        }
      ]
    },
    "performance": {
      "topMessageTypes": [
        {
          "type": "social_media_post",
          "count": 75,
          "averageRiskScore": 0.15
        }
      ],
      "topAudiences": [
        {
          "audience": "general_public",
          "count": 60,
          "averageRiskScore": 0.18
        }
      ]
    }
  }
}
```

### Message Performance Analytics

```http
GET /api/v1/campaigns/camp_123/analytics/messages?groupBy=type&timeframe=7d
Authorization: Bearer <token>
```

### User Activity Analytics

```http
GET /api/v1/campaigns/camp_123/analytics/users?timeframe=30d
Authorization: Bearer <token>
```

---

## Webhook API

### List Webhooks

```http
GET /api/v1/campaigns/camp_123/webhooks
Authorization: Bearer <token>
```

### Create Webhook

```http
POST /api/v1/campaigns/camp_123/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/akashic",
  "events": ["message.created", "message.approved", "team.member_added"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

The following events can trigger webhooks:

| Event | Description |
|-------|-------------|
| `message.created` | New message generated |
| `message.updated` | Message content updated |
| `message.approved` | Message approved for use |
| `message.rejected` | Message rejected |
| `team.member_added` | New team member added |
| `team.member_removed` | Team member removed |
| `campaign.updated` | Campaign details updated |
| `data.import_completed` | Data import finished |

### Webhook Payload Format

```json
{
  "id": "evt_123",
  "type": "message.created",
  "createdAt": "2024-01-15T10:30:00Z",
  "data": {
    "message": {
      "id": "msg_456",
      "content": "Generated message content...",
      "type": "social_media_post",
      "status": "draft"
    },
    "campaign": {
      "id": "camp_123",
      "name": "PA-01 Congressional Campaign"
    }
  }
}
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `AUTHENTICATION_REQUIRED` | 401 | Missing or invalid authentication |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for one or more fields",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Email address format is invalid"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

All API responses include rate limiting headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
X-RateLimit-Window: 3600
```

### Rate Limits by Plan

| Plan | Requests/Hour | Burst Limit |
|------|---------------|-------------|
| Free | 100 | 10 |
| Pro | 1,000 | 50 |
| Enterprise | 10,000 | 200 |

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

---

## SDK & Libraries

### Official SDKs

#### JavaScript/TypeScript SDK

```bash
npm install @akashic-intelligence/sdk
```

```typescript
import { AkashicClient } from '@akashic-intelligence/sdk'

const client = new AkashicClient({
  apiKey: 'your-api-key',
  baseURL: 'https://app.akashicintelligence.com/api/v1'
})

// Generate a message
const message = await client.messages.generate('camp_123', {
  type: 'social_media_post',
  audience: 'general_public',
  intent: 'Promote healthcare policy'
})

// List campaigns
const campaigns = await client.campaigns.list({
  page: 1,
  limit: 20
})
```

#### Python SDK

```bash
pip install akashic-intelligence
```

```python
from akashic_intelligence import AkashicClient

client = AkashicClient(
    api_key='your-api-key',
    base_url='https://app.akashicintelligence.com/api/v1'
)

# Generate a message
message = client.messages.generate('camp_123', {
    'type': 'social_media_post',
    'audience': 'general_public',
    'intent': 'Promote healthcare policy'
})

# List campaigns
campaigns = client.campaigns.list(page=1, limit=20)
```

### Community Libraries

- **PHP**: `akashic-intelligence/php-sdk`
- **Ruby**: `akashic-intelligence-ruby`
- **Go**: `go-akashic-intelligence`
- **Java**: `akashic-intelligence-java`

### Postman Collection

Import our Postman collection for easy API testing:

```
https://app.akashicintelligence.com/api/postman-collection.json
```

### OpenAPI Specification

Download the complete OpenAPI 3.0 specification:

```
https://app.akashicintelligence.com/api/openapi.json
```

---

This comprehensive API documentation provides all the information needed to integrate with the Akashic Intelligence platform, enabling developers to build powerful campaign management tools and custom integrations.

