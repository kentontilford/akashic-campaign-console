# Database Schema Document
## Akashic Intelligence Campaign Console

### 1. Database Overview

**Database Type**: PostgreSQL 15+
**Key Features Used**:
- JSONB for flexible data storage
- Full-text search
- Geospatial data (PostGIS)
- Row-level security
- Partitioning for large tables

### 2. Core Schema Design

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'strategist', 'communications', 'field', 'finance', 'volunteer');
CREATE TYPE message_status AS ENUM ('draft', 'review', 'approved', 'published', 'archived');
CREATE TYPE approval_tier AS ENUM ('green', 'yellow', 'red');
CREATE TYPE integration_type AS ENUM ('van', 'actblue', 'mailchimp', 'facebook', 'twitter', 'instagram');
CREATE TYPE activity_type AS ENUM ('message_created', 'message_edited', 'message_approved', 'team_joined', 'data_imported');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    image_url TEXT,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Organizations table (for consultant accounts)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50),
    subscription_expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    office VARCHAR(255) NOT NULL,
    state VARCHAR(2),
    district VARCHAR(10),
    party VARCHAR(50) DEFAULT 'Democratic',
    election_date DATE,
    campaign_website TEXT,
    
    -- Candidate profiling
    candidate_profile JSONB DEFAULT '{}', -- 50+ question responses
    version_control_profiles JSONB DEFAULT '{}', -- Dynamic audience profiles
    opponent_profiles JSONB DEFAULT '[]', -- Array of opponent data
    
    -- Campaign settings
    settings JSONB DEFAULT '{}',
    ai_config JSONB DEFAULT '{}',
    approval_rules JSONB DEFAULT '{}',
    integrations JSONB DEFAULT '{}', -- Integration credentials/settings
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE,
    archived_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX idx_campaigns_election_date ON campaigns(election_date);
CREATE INDEX idx_campaigns_state_district ON campaigns(state, district);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    permissions JSONB DEFAULT '{}', -- Custom permissions
    invited_by_id UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_team_members_campaign ON team_members(campaign_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES users(id),
    
    -- Content
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL, -- email, social, press, speech
    version_control_key VARCHAR(100), -- Which profile was used
    
    -- AI Analysis
    ai_analysis JSONB DEFAULT '{}', -- Risk scores, suggestions, etc.
    historical_matches JSONB DEFAULT '[]', -- Similar historical messages
    predicted_performance JSONB DEFAULT '{}',
    
    -- Status and workflow
    status message_status DEFAULT 'draft',
    approval_tier approval_tier,
    approved_by_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    
    -- Performance tracking
    performance_metrics JSONB DEFAULT '{}',
    engagement_data JSONB DEFAULT '{}',
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_campaign ON messages(campaign_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_platform ON messages(platform);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_tags ON messages USING GIN(tags);

-- Message versions table (for tracking edits)
CREATE TABLE message_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(500),
    content TEXT,
    edited_by_id UUID REFERENCES users(id),
    changes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_message_versions_message ON message_versions(message_id);

-- Voters table
CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    external_id VARCHAR(255), -- VAN ID, etc.
    
    -- Personal info
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    suffix VARCHAR(20),
    date_of_birth DATE,
    
    -- Contact info
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB DEFAULT '{}', -- Street, city, state, zip
    location GEOGRAPHY(POINT, 4326), -- For geospatial queries
    
    -- Political info
    party_registration VARCHAR(50),
    voting_history JSONB DEFAULT '[]',
    
    -- Akashic Intelligence
    american_nation_region VARCHAR(50),
    pew_typology VARCHAR(50),
    turnout_score DECIMAL(3,2), -- 0.00 to 1.00
    persuasion_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Custom fields and tags
    custom_fields JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    last_contacted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voters_campaign ON voters(campaign_id);
CREATE INDEX idx_voters_external_id ON voters(campaign_id, external_id);
CREATE INDEX idx_voters_name ON voters(last_name, first_name);
CREATE INDEX idx_voters_location ON voters USING GIST(location);
CREATE INDEX idx_voters_scores ON voters(turnout_score, persuasion_score);
CREATE INDEX idx_voters_tags ON voters USING GIN(tags);

-- Voter interactions table
CREATE TABLE voter_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    interaction_type VARCHAR(50) NOT NULL, -- call, text, email, canvass, event
    channel VARCHAR(50), -- phone, sms, email, door
    outcome VARCHAR(100), -- contacted, not_home, refused, etc.
    
    notes TEXT,
    duration_seconds INTEGER,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_voter ON voter_interactions(voter_id);
CREATE INDEX idx_interactions_campaign ON voter_interactions(campaign_id);
CREATE INDEX idx_interactions_type ON voter_interactions(interaction_type);
CREATE INDEX idx_interactions_created ON voter_interactions(created_at);

-- Donors table
CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- If they have an account
    
    -- Personal info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB DEFAULT '{}',
    
    -- Donor info
    employer VARCHAR(255),
    occupation VARCHAR(255),
    total_contributed DECIMAL(10,2) DEFAULT 0,
    largest_contribution DECIMAL(10,2) DEFAULT 0,
    first_contribution_date DATE,
    last_contribution_date DATE,
    contribution_count INTEGER DEFAULT 0,
    
    -- AI insights
    predicted_ask_amount DECIMAL(10,2),
    engagement_score DECIMAL(3,2),
    churn_risk DECIMAL(3,2),
    network_value DECIMAL(10,2), -- Estimated value of their network
    
    -- Categories and tags
    donor_level VARCHAR(50), -- grassroots, major, max
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donors_campaign ON donors(campaign_id);
CREATE INDEX idx_donors_email ON donors(email);
CREATE INDEX idx_donors_total ON donors(total_contributed DESC);
CREATE INDEX idx_donors_tags ON donors USING GIN(tags);

-- Contributions table
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
    
    amount DECIMAL(10,2) NOT NULL,
    processing_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    
    contribution_date DATE NOT NULL,
    source VARCHAR(50), -- actblue, check, cash, etc.
    payment_method VARCHAR(50), -- credit_card, ach, check
    
    -- FEC compliance
    is_itemized BOOLEAN DEFAULT FALSE,
    employer VARCHAR(255),
    occupation VARCHAR(255),
    
    -- Tracking
    solicitation_id UUID, -- Link to email/event that generated
    external_id VARCHAR(255), -- ActBlue transaction ID, etc.
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributions_campaign ON contributions(campaign_id);
CREATE INDEX idx_contributions_donor ON contributions(donor_id);
CREATE INDEX idx_contributions_date ON contributions(contribution_date);
CREATE INDEX idx_contributions_amount ON contributions(amount);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES users(id),
    
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- fundraiser, rally, town_hall, etc.
    description TEXT,
    
    -- Location
    venue_name VARCHAR(255),
    address JSONB DEFAULT '{}',
    location GEOGRAPHY(POINT, 4326),
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_link TEXT,
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    timezone VARCHAR(50),
    
    -- Capacity and goals
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    attended_count INTEGER DEFAULT 0,
    fundraising_goal DECIMAL(10,2),
    fundraising_total DECIMAL(10,2) DEFAULT 0,
    
    -- AI predictions
    predicted_attendance INTEGER,
    predicted_revenue DECIMAL(10,2),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_campaign ON events(campaign_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_location ON events USING GIST(location);

-- Budget tracking table
CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    
    category VARCHAR(50) NOT NULL, -- staff, media, field, digital, events, consultants, travel
    subcategory VARCHAR(100),
    description TEXT,
    
    budgeted_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    committed_amount DECIMAL(10,2) DEFAULT 0, -- Contracted but not paid
    
    period_start DATE,
    period_end DATE,
    
    -- AI insights
    roi_score DECIMAL(5,2),
    optimization_suggestions JSONB DEFAULT '{}',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_campaign ON budget_items(campaign_id);
CREATE INDEX idx_budget_category ON budget_items(category);
CREATE INDEX idx_budget_period ON budget_items(period_start, period_end);

-- Campaign intelligence table
CREATE TABLE campaign_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- District analysis
    american_nations_profile JSONB DEFAULT '{}',
    pew_typology_breakdown JSONB DEFAULT '{}',
    demographic_analysis JSONB DEFAULT '{}',
    
    -- Historical comparisons
    historical_comparisons JSONB DEFAULT '[]',
    similar_campaigns JSONB DEFAULT '[]',
    
    -- Strategic insights
    strategic_recommendations JSONB DEFAULT '[]',
    opportunities JSONB DEFAULT '[]',
    risks JSONB DEFAULT '[]',
    
    -- Predictions
    turnout_prediction JSONB DEFAULT '{}',
    vote_share_prediction JSONB DEFAULT '{}',
    
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intelligence_campaign ON campaign_intelligence(campaign_id);

-- Activity feed table
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    activity_type activity_type NOT NULL,
    entity_type VARCHAR(50), -- message, voter, event, etc.
    entity_id UUID,
    
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_campaign ON activity_feed(campaign_id);
CREATE INDEX idx_activity_user ON activity_feed(user_id);
CREATE INDEX idx_activity_created ON activity_feed(created_at DESC);
CREATE INDEX idx_activity_type ON activity_feed(activity_type);

-- AI conversation history
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    conversation_type VARCHAR(50), -- message_generation, analysis, strategy
    messages JSONB DEFAULT '[]', -- Array of {role, content, timestamp}
    
    total_tokens INTEGER DEFAULT 0,
    cost_cents INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_campaign ON ai_conversations(campaign_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);

-- Integration sync status
CREATE TABLE integration_sync_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    integration_type integration_type NOT NULL,
    
    last_sync_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(50), -- pending, in_progress, completed, failed
    
    records_synced INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(campaign_id, integration_type)
);

CREATE INDEX idx_sync_status_campaign ON integration_sync_status(campaign_id);
CREATE INDEX idx_sync_status_next_sync ON integration_sync_status(next_sync_at);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for campaigns
CREATE POLICY campaign_access ON campaigns
    FOR ALL
    USING (
        id IN (
            SELECT campaign_id 
            FROM team_members 
            WHERE user_id = current_setting('app.current_user_id')::UUID
        )
    );
```

### 3. Indexing Strategy

**Primary Indexes**: Created with table definitions above

**Additional Performance Indexes**:
```sql
-- Full text search on messages
CREATE INDEX idx_messages_content_search ON messages USING GIN(to_tsvector('english', content));

-- Geospatial indexes for proximity searches
CREATE INDEX idx_voters_location_geo ON voters USING GIST(location);
CREATE INDEX idx_events_location_geo ON events USING GIST(location);

-- Partial indexes for common queries
CREATE INDEX idx_active_campaigns ON campaigns(id) WHERE is_active = TRUE;
CREATE INDEX idx_published_messages ON messages(campaign_id, published_at) WHERE status = 'published';
CREATE INDEX idx_high_value_donors ON donors(campaign_id) WHERE total_contributed > 1000;
```

### 4. Data Partitioning

For large tables, implement partitioning:

```sql
-- Partition voter_interactions by month
CREATE TABLE voter_interactions_2024_01 PARTITION OF voter_interactions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Partition activity_feed by campaign and month
CREATE TABLE activity_feed_partitioned (LIKE activity_feed INCLUDING ALL)
PARTITION BY RANGE (created_at);
```

### 5. Initial Seed Data

```sql
-- Insert default version control profiles
INSERT INTO campaigns (id, name, slug, candidate_name, office, version_control_profiles)
VALUES (
    uuid_generate_v4(),
    'Sample Campaign',
    'sample-campaign',
    'Jane Doe',
    'US House - District 5',
    '{
        "union": {
            "name": "Union",
            "tone": "solidarity",
            "emphasis": ["workers rights", "fair wages", "collective bargaining"],
            "avoid": ["management perspective", "corporate profits"]
        },
        "chamber": {
            "name": "Chamber of Commerce",
            "tone": "pro-business",
            "emphasis": ["economic growth", "job creation", "innovation"],
            "avoid": ["regulation", "tax increases"]
        },
        "youth": {
            "name": "Youth",
            "tone": "energetic",
            "emphasis": ["future", "change", "technology", "climate"],
            "avoid": ["status quo", "traditional"]
        }
    }'::jsonb
);
```

### 6. Backup and Recovery

```sql
-- Create backup schema
CREATE SCHEMA backup;

-- Function to backup critical data
CREATE OR REPLACE FUNCTION backup_campaign_data(campaign_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Backup messages
    INSERT INTO backup.messages 
    SELECT * FROM messages WHERE campaign_id = campaign_uuid;
    
    -- Backup voters
    INSERT INTO backup.voters 
    SELECT * FROM voters WHERE campaign_id = campaign_uuid;
    
    -- Add more tables as needed
END;
$$ LANGUAGE plpgsql;
```

### 7. Performance Optimization

```sql
-- Materialized view for campaign dashboard
CREATE MATERIALIZED VIEW campaign_dashboard AS
SELECT 
    c.id,
    c.name,
    COUNT(DISTINCT v.id) as voter_count,
    COUNT(DISTINCT d.id) as donor_count,
    SUM(co.amount) as total_raised,
    COUNT(DISTINCT m.id) as message_count
FROM campaigns c
LEFT JOIN voters v ON v.campaign_id = c.id
LEFT JOIN donors d ON d.campaign_id = c.id
LEFT JOIN contributions co ON co.campaign_id = c.id
LEFT JOIN messages m ON m.campaign_id = c.id
GROUP BY c.id, c.name;

CREATE UNIQUE INDEX ON campaign_dashboard(id);

-- Refresh periodically
CREATE OR REPLACE FUNCTION refresh_campaign_dashboard()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_dashboard;
END;
$$ LANGUAGE plpgsql;
```